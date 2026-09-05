import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { Land3DMap } from '../../components/common/Land3DMap';
import { landService } from '../../services/landService';
import type { PublicLandRecord } from '../../types';

interface SuggestionItem {
  display: string;
  value: string;
  record?: PublicLandRecord;
}

export const PublicSearchPage: React.FC = () => {
  const [surveyNumber, setSurveyNumber] = useState('');
  const [village, setVillage] = useState('');
  const [taluk, setTaluk] = useState('');
  const [district, setDistrict] = useState('');
  
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PublicLandRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedLand, setSelectedLand] = useState<PublicLandRecord | null>(null);

  // Suggestions state
  const [activeField, setActiveField] = useState<'surveyNumber' | 'village' | 'taluk' | 'district' | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimer, setSearchTimer] = useState<any>(null);

  const handleViewLand = (record: PublicLandRecord) => {
    setSelectedLand(record);
    setTimeout(() => {
      document.getElementById('land-map-details-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleView3D = (record: PublicLandRecord) => {
    setSelectedLand(record);
    setTimeout(() => {
      document.getElementById('land-map-details-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [searchTimer]);

  // Load all records on mount
  useEffect(() => {
    const loadInitialRecords = async () => {
      setLoading(true);
      setHasSearched(true);
      setErrorMsg(null);
      try {
        const res = await landService.searchLandRecords({});
        if ((res.status === 'success' || res.success) && res.data) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
          setErrorMsg(res.message || 'No search results returned.');
        }
      } catch (err: any) {
        setSearchResults([]);
        setErrorMsg(err.message || 'Error connecting to search services.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialRecords();
  }, []);

  const triggerSuggestions = (field: 'surveyNumber' | 'village' | 'taluk' | 'district', queryText: string) => {
    if (searchTimer) clearTimeout(searchTimer);

    if (queryText.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const searchParams: any = {};
        if (field === 'surveyNumber') searchParams.survey_number = queryText;
        if (field === 'village') searchParams.village = queryText;
        if (field === 'taluk') searchParams.taluk = queryText;
        if (field === 'district') searchParams.district = queryText;

        const res = await landService.searchLandRecords(searchParams);
        if ((res.status === 'success' || res.success) && res.data) {
          const items: SuggestionItem[] = [];
          const seen = new Set<string>();

          res.data.forEach(r => {
            if (field === 'surveyNumber' && r.survey_number) {
              const display = `${r.survey_number} (${r.village})`;
              if (!seen.has(display)) {
                seen.add(display);
                items.push({ display, value: r.survey_number, record: r });
              }
            } else if (field === 'village' && r.village) {
              const display = r.village;
              if (!seen.has(display.toLowerCase())) {
                seen.add(display.toLowerCase());
                items.push({ display, value: r.village, record: r });
              }
            } else if (field === 'taluk' && r.taluk) {
              const display = r.taluk;
              if (!seen.has(display.toLowerCase())) {
                seen.add(display.toLowerCase());
                items.push({ display, value: r.taluk, record: r });
              }
            } else if (field === 'district' && r.district) {
              const display = r.district;
              if (!seen.has(display.toLowerCase())) {
                seen.add(display.toLowerCase());
                items.push({ display, value: r.district, record: r });
              }
            }
          });

          setSuggestions(items.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (err) {}
    }, 200);

    setSearchTimer(timer);
  };

  const handleSelectSuggestion = (s: SuggestionItem) => {
    if (activeField === 'surveyNumber') {
      setSurveyNumber(s.value);
      if (s.record) {
        setVillage(s.record.village || '');
        setTaluk(s.record.taluk || '');
        setDistrict(s.record.district || '');
      }
    } else if (activeField === 'village') {
      setVillage(s.value);
      if (s.record) {
        setTaluk(s.record.taluk || '');
        setDistrict(s.record.district || '');
      }
    } else if (activeField === 'taluk') {
      setTaluk(s.value);
      if (s.record) {
        setDistrict(s.record.district || '');
      }
    } else if (activeField === 'district') {
      setDistrict(s.value);
    }
    setShowSuggestions(false);
    setActiveField(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    setShowSuggestions(false);

    try {
      const res = await landService.searchLandRecords({
        survey_number: surveyNumber.trim() || undefined,
        village: village.trim() || undefined,
        taluk: taluk.trim() || undefined,
        district: district.trim() || undefined
      });

      if ((res.status === 'success' || res.success) && res.data) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
        setErrorMsg(res.message || 'No search results returned.');
      }
    } catch (err: any) {
      setSearchResults([]);
      setErrorMsg(err.message || 'Error connecting to search services.');
    } finally {
      setLoading(false);
    }
  };

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowSuggestions(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#034E4E] tracking-tight">
          Public Land Search
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1 leading-relaxed">
          Search publicly available land-record indicators using survey number, village, taluk and district.
        </p>
      </div>

      {/* Privacy Disclosure Notice */}
      <div className="p-4 rounded-xl bg-[#F4F8F7] border border-[#D9E2E1] text-[#101828] text-xs flex items-start space-x-3.5 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
        <div className="w-8 h-8 rounded-lg bg-[#EAF4F3] border border-[#0B6868]/20 flex items-center justify-center text-[#034E4E] shrink-0 mt-0.5">
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="font-bold text-[#034E4E] text-xs">Public Privacy Disclosure</h4>
          <p className="mt-1 leading-relaxed text-[#667085]">
            Public search results strictly display non-sensitive title indicators: <strong>Survey Number</strong>, <strong>Property Extent</strong>, <strong>Village</strong>, <strong>Taluk</strong>, and <strong>District</strong>. Personal ownership details, patta numbers, and sale considerations are kept private and accessible only to verified title owners.
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Survey Number Input */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Survey Number
              </label>
              <input
                type="text"
                placeholder="e.g. 124/3A"
                value={surveyNumber}
                onChange={(e) => {
                  setSurveyNumber(e.target.value);
                  setActiveField('surveyNumber');
                  triggerSuggestions('surveyNumber', e.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              {showSuggestions && activeField === 'surveyNumber' && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-xs divide-y divide-slate-100">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700 flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-800">{s.display}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Village Input */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
              <input
                type="text"
                placeholder="e.g. Sathuvachari"
                value={village}
                onChange={(e) => {
                  setVillage(e.target.value);
                  setActiveField('village');
                  triggerSuggestions('village', e.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              {showSuggestions && activeField === 'village' && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-xs divide-y divide-slate-100">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                    >
                      <span className="font-semibold text-slate-800">{s.display}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Taluk Input */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Taluk</label>
              <input
                type="text"
                placeholder="e.g. Vellore"
                value={taluk}
                onChange={(e) => {
                  setTaluk(e.target.value);
                  setActiveField('taluk');
                  triggerSuggestions('taluk', e.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              {showSuggestions && activeField === 'taluk' && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-xs divide-y divide-slate-100">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                    >
                      <span className="font-semibold text-slate-800">{s.display}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* District Input */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                placeholder="e.g. Vellore"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setActiveField('district');
                  triggerSuggestions('district', e.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              {showSuggestions && activeField === 'district' && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-xs divide-y divide-slate-100">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                    >
                      <span className="font-semibold text-slate-800">{s.display}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Public Records</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold text-[#101828]">Search Results</h2>
          <p className="text-xs text-[#667085] mt-0.5">Publicly available land indicators matching your search.</p>
        </div>

        {errorMsg && (
          <div className="p-4 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!hasSearched ? (
          <EmptyState
            title="Enter survey details to search"
            description="Enter a survey number and village name above to query public land title registry records."
            icon={<Search className="w-5 h-5 text-[#034E4E]" />}
          />
        ) : loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
            <p className="text-sm font-medium text-slate-500 mt-2">Querying database registry...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <EmptyState
            title="No public land records found."
            description="No property matches were returned for the provided survey criteria."
            icon={<AlertCircle className="w-6 h-6 text-slate-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((r, idx) => {
              const hasAnomalies = Array.isArray(r.anomalies) && r.anomalies.length > 0;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs">
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Survey Number</span>
                        <h4 className="text-base font-extrabold text-[#034E4E] font-mono">{r.survey_number}</h4>
                      </div>
                      <span className="bg-[#F4F8F7] border border-[#D9E2E1] text-[#034E4E] px-2 py-0.5 rounded text-[11px] font-bold">
                        {r.property_extent}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-[11px] text-slate-600">
                      <div>
                        <span className="block font-medium text-slate-400 text-[9px] uppercase">Village</span>
                        <span className="font-semibold text-slate-800 truncate block">{r.village}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-slate-400 text-[9px] uppercase">Taluk</span>
                        <span className="font-semibold text-slate-800 truncate block">{r.taluk}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-slate-400 text-[9px] uppercase">District</span>
                        <span className="font-semibold text-slate-800 truncate block">{r.district}</span>
                      </div>
                    </div>

                    {/* Anomaly notice section */}
                    {hasAnomalies ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>⚠️ Potential Anomaly</span>
                        </div>
                        {r.anomalies!.length === 1 ? (
                          <div className="text-[10px] text-amber-700 leading-normal space-y-0.5">
                            <p><b>Anomaly Type:</b> {r.anomalies![0].anomaly_type}</p>
                            <p><b>Severity:</b> <span className="capitalize">{r.anomalies![0].severity}</span></p>
                            <p><b>Risk Score:</b> {r.anomalies![0].risk_score}</p>
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-700 leading-normal">
                            <p className="font-semibold">{r.anomalies!.length} anomalies detected</p>
                            <p className="mt-0.5">Click View Land to inspect details.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-800 font-semibold flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>No anomalies reported for this record.</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleViewLand(r)}
                      className="flex-1 py-2 text-center border border-[#034E4E] hover:bg-[#F4F8F7] text-[#034E4E] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      View Land
                    </button>
                    <button
                      onClick={() => handleView3D(r)}
                      className="flex-1 py-2 text-center bg-[#034E4E] hover:bg-[#023B3B] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      View in 3D
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Land Detail Section */}
      {selectedLand && (
        <div id="land-map-details-section" className="scroll-mt-6 space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Property Workspace</span>
              <h3 className="text-lg font-extrabold text-[#034E4E] mt-0.5 tracking-tight">
                3D Globe & Property Detail View
              </h3>
            </div>
            <button
              onClick={() => setSelectedLand(null)}
              className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Map Container */}
            <div className="lg:col-span-2">
              <Land3DMap
                key={selectedLand.id || selectedLand.survey_number}
                className="h-[500px]"
                latitude={selectedLand.latitude}
                longitude={selectedLand.longitude}
                surveyNumber={selectedLand.survey_number}
                village={selectedLand.village}
                taluk={selectedLand.taluk}
                district={selectedLand.district}
                propertyExtent={selectedLand.property_extent}
                landType={selectedLand.land_type}
              />
            </div>

            {/* Sidebar Details Panel */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between h-[500px] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Basic Title Information
                  </h4>
                  <div className="mt-3 text-xs space-y-2">
                    <p className="text-slate-600"><b>Survey No:</b> <span className="font-bold font-mono text-[#034E4E]">{selectedLand.survey_number}</span></p>
                    <p className="text-slate-600"><b>Property Extent:</b> <span className="font-semibold text-slate-800">{selectedLand.property_extent}</span></p>
                    <p className="text-slate-600"><b>Land Classification:</b> <span className="font-semibold text-slate-800">{selectedLand.land_type || 'N/A'}</span></p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Location Indicators
                  </h4>
                  <div className="mt-3 text-xs space-y-2 text-slate-600">
                    <p><b>Village:</b> {selectedLand.village}</p>
                    <p><b>Taluk:</b> {selectedLand.taluk}</p>
                    <p><b>District:</b> {selectedLand.district}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Anomalies & Discrepancies
                  </h4>
                  <div className="mt-3 space-y-3">
                    {Array.isArray(selectedLand.anomalies) && selectedLand.anomalies.length > 0 ? (
                      selectedLand.anomalies.map((a, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                          <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>⚠ Potential Anomaly</span>
                          </div>
                          <div className="text-[11px] text-amber-700 leading-normal space-y-1">
                            <p><b>Type:</b> {a.anomaly_type}</p>
                            <p><b>Severity:</b> <span className="capitalize font-semibold">{a.severity}</span></p>
                            <p><b>Risk Score:</b> <span className="font-mono font-bold">{a.risk_score}</span></p>
                            {a.description && <p className="text-[10px] text-amber-600 italic bg-white/50 p-1.5 rounded border border-amber-100 mt-1">"{a.description}"</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-semibold flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>No anomalies reported for this record.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-center">
                WGS 84 • 3D Terrain Elevation Engine
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
