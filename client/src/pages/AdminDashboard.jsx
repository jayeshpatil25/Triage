import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, Users, AlertTriangle, Zap } from 'lucide-react';

const AdminDashboard = () => {
    // Mock state for mutations - in potential real app, these would trigger backend logic
    const [mutationA, setMutationA] = useState(false);
    const [mutationB, setMutationB] = useState(false);
    const [systemHealth, setSystemHealth] = useState({ uptime: '99.9%', latency: '12ms' });
    const [assignmentStatus, setAssignmentStatus] = useState(null);

    useEffect(() => {
        // Fetch initial status
        api.get('/patients/system/status').then(res => {
            setMutationA(res.data.highLoad);
            setMutationB(res.data.staffShortage);
        });
    }, []);

    const toggleMutationA = async () => {
        const newState = !mutationA;
        setMutationA(newState);
        await api.post('/patients/system/mutation', { mode: 'HighLoad', active: newState });
    };

    const toggleMutationB = async () => {
        const newState = !mutationB;
        setMutationB(newState);
        await api.post('/patients/system/mutation', { mode: 'StaffShortage', active: newState });
    };

    const triggerAssignment = async () => {
        try {
            setAssignmentStatus({ type: 'loading', message: 'Triggering auto-assignment...' });
            const res = await api.post('/patients/assign');
            if (res.data.assignments.length > 0) {
                setAssignmentStatus({
                    type: 'success',
                    message: `✅ Assigned ${res.data.assignments.length} patient(s): ${res.data.assignments.map(a => `${a.patient} → ${a.doctor}`).join(', ')}`
                });
            } else {
                setAssignmentStatus({ type: 'info', message: '⚠️ No assignments made (no waiting patients or no available doctors)' });
            }
            setTimeout(() => setAssignmentStatus(null), 5000);
        } catch (err) {
            setAssignmentStatus({ type: 'error', message: '❌ Assignment failed: ' + err.message });
            setTimeout(() => setAssignmentStatus(null), 5000);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <Settings className="mr-3 text-slate-600" />
                System Administration & Stress Testing
            </h2>

            {/* Auto-Assignment Trigger */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                    <Zap className="mr-2 text-blue-600" size={20} />
                    Manual Auto-Assignment Trigger
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                    Manually trigger the auto-assignment algorithm to assign waiting patients to available doctors.
                </p>
                <button
                    onClick={triggerAssignment}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    🔄 Trigger Assignment Now
                </button>
                {assignmentStatus && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${assignmentStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                            assignmentStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                                assignmentStatus.type === 'loading' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                        }`}>
                        {assignmentStatus.message}
                    </div>
                )}
            </div>

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
