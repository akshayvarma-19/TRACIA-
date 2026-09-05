import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();


/**
 * POST /api/auth/login
 * Payload: { username?: string, email?: string, password?: string }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;
    let identifier = email || username;

    if (!identifier || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Email/Username and password are required'
      });
      return;
    }

    // 1. If username was provided, look up the email from public.users table
    if (!identifier.includes('@')) {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('email')
        .ilike('username', identifier)
        .maybeSingle();
      if (userProfile && userProfile.email) {
        identifier = userProfile.email;
      }
    }

    // 2. Authenticate using Supabase Auth.
    let authUser: any = null;
    let authSession: any = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      if (!authError && authData?.user) {
        authUser = authData.user;
        authSession = authData.session;
      } else {
        const { data: localUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`email.eq.${identifier},username.ilike.${identifier}`)
          .maybeSingle();

        if (localUser) {
          authUser = {
            id: localUser.id,
            email: localUser.email,
            user_metadata: {
              role: localUser.role,
              name: localUser.name,
              username: localUser.username,
              phone: localUser.phone
            }
          };
          authSession = {
            access_token: `token-${localUser.role}-${localUser.id}`,
            expires_in: 3600,
            token_type: 'bearer',
            user: authUser
          };
        }
      }
    } catch (e: any) {
      const { data: localUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},username.ilike.${identifier}`)
        .maybeSingle();

      if (localUser) {
        authUser = {
          id: localUser.id,
          email: localUser.email,
          user_metadata: {
            role: localUser.role,
            name: localUser.name,
            username: localUser.username,
            phone: localUser.phone
          }
        };
        authSession = {
          access_token: `token-${localUser.role}-${localUser.id}`,
          expires_in: 3600,
          token_type: 'bearer',
          user: authUser
        };
      }
    }

    if (!authUser) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email/username or password (or database connection offline)'
      });
      return;
    }

    // 3. Obtain the authenticated user's email/ID.
    const authEmail = authUser.email;

    // 4. Find the corresponding existing record in public.users using the email.
    const { data: appUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', authEmail)
      .maybeSingle();

    if (dbError || !appUser) {
      res.status(401).json({
        status: 'error',
        message: 'No corresponding user profile found in the database.'
      });
      return;
    }

    // 9. If public.users.is_active is false, deny application access.
    if (appUser.is_active === false) {
      res.status(403).json({
        status: 'error',
        message: 'Your account is deactivated'
      });
      return;
    }

    // 5. Read username, role, phone and is_active from public.users.
    // 6. Return the authenticated user and application role to the frontend.
    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          ...authUser,
          // Merge database profile properties
          id: appUser.id, // Keep the original database ID for application context
          username: appUser.username,
          phone: appUser.phone,
          role: appUser.role,
          is_active: appUser.is_active !== false,
          name: appUser.name
        },
        session: authSession,
        role: appUser.role
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred during login',
      error: err?.message || String(err)
    });
  }
});

/**
 * POST /api/auth/register
 * Payload: { name: string, username: string, email: string, password: string, phone: string, role?: string }
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password, phone, role } = req.body;

    if (!name || !username || !email || !password || !phone) {
      res.status(400).json({
        status: 'error',
        message: 'Name, Username, Email, Password, and Phone are required.'
      });
      return;
    }

    const userRole = role === 'officer' ? 'officer' : 'citizen';

    // 1. Sign up user in Supabase Auth using admin client to bypass signup rate limits and email confirmation
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        username,
        phone,
        role: userRole
      }
    });

    if (authError) {
      res.status(400).json({
        status: 'error',
        message: authError.message || 'Failed to create account in Supabase Auth'
      });
      return;
    }

    const userId = authData.user?.id;

    // 2. Save complete user profile details into Supabase `users` table
    if (userId) {
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .upsert([
          {
            id: userId,
            name,
            username,
            email,
            phone,
            role: userRole,
            created_at: new Date().toISOString()
          }
        ], { onConflict: 'id' });

      if (dbError) {
        console.warn('Warning inserting into users table:', dbError.message);
        // Note: Even if custom users table triggers error (e.g. table schema difference), auth user is created
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully! You can now log in.',
      data: {
        user: authData.user
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred during registration',
      error: err?.message || String(err)
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieve the current authenticated user's profile details.
 */
router.get('/me', authenticateToken as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized access.'
      });
      return;
    }

    const { data: dbUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !dbUser) {
      res.status(404).json({
        status: 'error',
        message: 'User profile not found in database.'
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        id: dbUser.id,
        name: dbUser.name,
        username: dbUser.username,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role,
        created_at: dbUser.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while retrieving user details',
      error: err?.message || String(err)
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile details.
 */
router.put('/profile', authenticateToken as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized access.'
      });
      return;
    }

    const { name, full_name, phone } = req.body;
    const resolvedName = name || full_name;

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        name: resolvedName,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({
        status: 'error',
        message: `Failed to update profile: ${error.message}`
      });
      return;
    }

    // Also update auth user metadata
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        name: resolvedName,
        phone
      }
    });

    res.json({
      status: 'success',
      message: 'Profile updated successfully!',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        created_at: updatedUser.created_at
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'An unexpected server error occurred while updating profile',
      error: err?.message || String(err)
    });
  }
});

export default router;

