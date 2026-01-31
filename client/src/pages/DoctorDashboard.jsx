import React, { useEffect, useState } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import QueueList from '../components/QueueList';
import { Activity } from 'lucide-react';

const DoctorDashboard = () => {
    const [queue, setQueue] = useState([]);

    const fetchQueue = async () => {
        try {
            const res = await api.get('/patients/queue');
            setQueue(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchQueue();

        socket.on('QUEUE_UPDATE', (updatedQueue) => {
            setQueue(updatedQueue);
        });

        return () => {
            socket.off('QUEUE_UPDATE');
        };
    }, []);

    return (
        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Activity className="mr-3 text-blue-500" />
                        Live Patient Queue
                    </h2>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {queue.length} Patients Waiting
                    </span>
                </div>
                <QueueList patients={queue} />
            </div>

            <div className="col-span-1 space-y-6">
                {/* Stats / Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Clinic Status</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Avg Wait Time</span>
                            <span className="font-bold text-slate-800">12 min</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Doctors Active</span>
                            <span className="font-bold text-slate-800">3/4</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Critical Cases</span>
                            <span className="font-bold text-red-600">{queue.filter(p => p.priorityLevel === 'Critical').length}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">My Current Patient</h4>
                        <div className="text-center py-4 text-slate-500 italic text-sm">
                            No patient currently selected.
                        </div>
                        <button className="w-full mt-2 bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">
                            Call Next Patient
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
