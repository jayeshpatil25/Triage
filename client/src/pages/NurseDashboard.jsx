import React, { useEffect, useState } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { Activity, Thermometer, Heart } from 'lucide-react';

const NurseDashboard = () => {
    const [patients, setPatients] = useState([]);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients/queue');
            setPatients(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPatients();
        socket.on('QUEUE_UPDATE', (updatedQueue) => {
            setPatients(updatedQueue);
        });
        return () => socket.off('QUEUE_UPDATE');
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Activity className="mr-3 text-teal-500" />
                Nurse Station - Vitals Monitor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(p => (
                    <div key={p._id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${p.priorityLevel === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {p.priorityLevel}
                                </span>
                            </div>
                            <div className="text-right text-xs text-slate-400">
                                <p>Age: {p.age}</p>
                                <p>{p.gender}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Thermometer size={16} className={p.vitals.temperature > 38 ? 'text-red-500' : 'text-slate-400'} />
                                <span className="font-mono font-medium">{p.vitals.temperature}°C</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Heart size={16} className={p.vitals.spo2 < 95 ? 'text-red-500' : 'text-slate-400'} />
                                <span className="font-mono font-medium">{p.vitals.spo2}% SpO2</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Activity size={16} className="text-slate-400" />
                                <span className="font-mono font-medium">{p.vitals.bloodPressure}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-500 truncate max-w-[60%]">{p.explanation}</span>
                            <button className="text-sm text-teal-600 font-medium hover:text-teal-700">Update Vitals</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NurseDashboard;
