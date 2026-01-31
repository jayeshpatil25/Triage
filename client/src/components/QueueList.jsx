import React from 'react';
import { Clock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const QueueList = ({ patients }) => {
    const getPriorityColor = (level) => {
        switch (level) {
            case 'Critical': return 'bg-red-50 border-red-200 hover:bg-red-100';
            case 'Urgent': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
            case 'Semi-Urgent': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
            default: return 'bg-white border-slate-100 hover:bg-slate-50';
        }
    };

    const getPriorityBadge = (level) => {
        switch (level) {
            case 'Critical': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center"><AlertTriangle size={12} className="mr-1" /> CRITICAL</span>;
            case 'Urgent': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">URGENT</span>;
            case 'Semi-Urgent': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">SEMI-URGENT</span>;
            default: return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">ROUTINE</span>;
        }
    };

    return (
        <div className="space-y-4">
            {patients.map((p, index) => (
                <div
                    key={p._id}
                    className={`relative p-5 rounded-xl border transition-all duration-200 shadow-sm ${getPriorityColor(p.priorityLevel)}`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className="text-xl font-bold text-slate-800">{p.name}</span>
                                {getPriorityBadge(p.priorityLevel)}
                                <span className="text-xs text-slate-500">#{index + 1} in Queue</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mt-3">
                                <div className="flex items-center space-x-2">
                                    <Activity size={16} className="text-blue-500" />
                                    <span>Score: <b className="text-slate-800">{Math.round(p.triageScore)}</b></span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock size={16} className="text-slate-400" />
                                    <span>Waited: {Math.floor((new Date() - new Date(p.arrivalTime)) / 60000)} min</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-white/60 rounded-lg text-xs text-slate-500 border border-slate-200/50">
                                <span className="font-semibold text-slate-700">Triage Reason: </span>
                                {p.explanation || 'Standard evaluation'}
                            </div>
                        </div>

                        <div className="ml-4 flex flex-col items-end space-y-2">
                            <div className="text-right text-xs text-slate-400">
                                <span className="block font-medium text-slate-500">Vitals</span>
                                <span>Temp: {p.vitals?.temperature}°C</span>
                                <span className="mx-1">•</span>
                                <span>SpO2: {p.vitals?.spo2}%</span>
                            </div>
                            {p.status === 'Waiting' && (
                                <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">
                                    <span>Review</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {patients.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                    <CheckCircle size={48} className="mx-auto mb-3 text-slate-300" />
                    <p>No patients in queue.</p>
                </div>
            )}
        </div>
    );
};

export default QueueList;
