import React, { useState } from 'react';
import { Settings, Users, AlertTriangle, Zap } from 'lucide-react';

const AdminDashboard = () => {
    // Mock state for mutations - in potential real app, these would trigger backend logic
    const [mutationA, setMutationA] = useState(false);
    const [mutationB, setMutationB] = useState(false);

    const toggleMutationA = () => {
        setMutationA(!mutationA);
        // Ideally call API to enable "High Load Mode"
    };

    const toggleMutationB = () => {
        setMutationB(!mutationB);
        // Ideally call API to enable "Staff Shortage Mode"
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <Settings className="mr-3 text-slate-600" />
                System Administration & Stress Testing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mutation A Card */}
                <div className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${mutationA ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-red-300'
                    }`} onClick={toggleMutationA}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-100 rounded-lg text-red-600">
                            <Zap size={24} />
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${mutationA ? 'bg-red-500' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${mutationA ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Mutation A: Sudden Influx</h3>
                    <p className="text-slate-600 text-sm mb-4">
                        Simulates a 200% increase in patient volume. System should tighten triage thresholds and auto-defer non-critical cases.
                    </p>
                    {mutationA && <span className="text-xs font-bold text-red-600 animate-pulse">● ACTIVE: TRIAGE THRESHOLDS ADJUSTED</span>}
                </div>

                {/* Mutation B Card */}
                <div className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${mutationB ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300'
                    }`} onClick={toggleMutationB}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                            <Users size={24} />
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${mutationB ? 'bg-orange-500' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${mutationB ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Mutation B: Staff Shortage</h3>
                    <p className="text-slate-600 text-sm mb-4">
                        Simulates a 40% drop in active staff. System should re-calculate ETAs and prioritize critical care over routine checks.
                    </p>
                    {mutationB && <span className="text-xs font-bold text-orange-600 animate-pulse">● ACTIVE: SCHEDULING OPTIMIZED FOR CRITICAL CARE</span>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-lg text-slate-800 mb-4">System Health</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-slate-800">99.9%</span>
                        <span className="text-xs text-slate-500">Uptime</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-green-600">12ms</span>
                        <span className="text-xs text-slate-500">Triage Latency</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-blue-600">Active</span>
                        <span className="text-xs text-slate-500">ML Model Status</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
