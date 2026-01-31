import React, { useEffect, useState } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import QueueList from '../components/QueueList';
import { Users, Clock, AlertTriangle } from 'lucide-react';

const ReceptionistDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [staff, setStaff] = useState([]);
    const [stats, setStats] = useState({
        totalWaiting: 0,
        criticalCount: 0,
        avgWaitTime: 0,
        doctorsAvailable: 0,
        doctorsBusy: 0
    });

    const fetchQueue = async () => {
        try {
            const res = await api.get('/patients/queue');
            setQueue(res.data);

            // Calculate stats
            const criticalCount = res.data.filter(p => p.priorityLevel === 'Critical').length;
            const avgWaitTime = res.data.length > 0
                ? Math.floor(res.data.reduce((acc, p) => acc + ((new Date() - new Date(p.arrivalTime)) / 60000), 0) / res.data.length)
                : 0;

            setStats(prev => ({
                ...prev,
                totalWaiting: res.data.length,
                criticalCount,
                avgWaitTime
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            const doctors = res.data.filter(s => s.role === 'Doctor');
            setStaff(doctors);

            setStats(prev => ({
                ...prev,
                doctorsAvailable: doctors.filter(d => d.status === 'Available').length,
                doctorsBusy: doctors.filter(d => d.status === 'Busy').length
            }));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchQueue();
        fetchStaff();

        socket.on('QUEUE_UPDATE', (updatedQueue) => {
            setQueue(updatedQueue);
            fetchStaff();
        });

        socket.on('ASSIGNMENT_UPDATE', () => {
            fetchStaff();
        });

        socket.on('STAFF_UPDATE', () => {
            fetchStaff();
        });

        const interval = setInterval(() => {
            fetchQueue();
            fetchStaff();
        }, 5000);

        return () => {
            socket.off('QUEUE_UPDATE');
            socket.off('ASSIGNMENT_UPDATE');
            socket.off('STAFF_UPDATE');
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Patients Waiting</p>
                            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalWaiting}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Critical Cases</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{stats.criticalCount}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Avg Wait Time</p>
                            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.avgWaitTime} <span className="text-lg">min</span></p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Doctors Status</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.doctorsAvailable} <span className="text-lg text-slate-400">/ {stats.doctorsAvailable + stats.doctorsBusy}</span></p>
                            <p className="text-xs text-slate-500 mt-1">Available</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Patient Queue</h2>
                    <QueueList patients={queue} />
                </div>

                <div className="col-span-1">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Doctors on Duty</h2>
                    <div className="space-y-3">
                        {staff.map(doctor => (
                            <div
                                key={doctor._id}
                                className={`p-4 rounded-xl border transition-all ${doctor.status === 'Available'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{doctor.name}</p>
                                        {doctor.specialization && doctor.specialization.length > 0 && (
                                            <p className="text-xs text-slate-500 mt-1">{doctor.specialization.join(', ')}</p>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${doctor.status === 'Available'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {doctor.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {staff.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                No doctors on duty
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
