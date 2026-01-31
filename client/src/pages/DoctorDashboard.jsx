import React, { useEffect, useState } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import QueueList from '../components/QueueList';
import { Activity, User } from 'lucide-react';

const DoctorDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');

    const fetchQueue = async () => {
        try {
            const res = await api.get('/patients/queue');
            setQueue(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/staff');
            const doctors = res.data.filter(s => s.role === 'Doctor');
            setDoctorsList(doctors);
            if (doctors.length > 0 && !selectedDoctorId) {
                setSelectedDoctorId(doctors[0]._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDoctorState = async () => {
        if (!selectedDoctorId) return;
        try {
            const res = await api.get(`/staff/${selectedDoctorId}`);
            console.log('👨‍⚕️ Doctor state fetched:', res.data);
            setCurrentDoctor(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompletePatient = async () => {
        if (!currentDoctor || !currentDoctor.currentPatient) return;

        try {
            await api.patch(`/patients/${currentDoctor.currentPatient._id}/status`, { status: 'Discharged' });
            fetchDoctorState();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        console.log('🔄 Setting up socket listeners and initial fetch');
        fetchQueue();
        fetchDoctors();

        const handleQueueUpdate = (updatedQueue) => {
            console.log('📢 QUEUE_UPDATE event received');
            setQueue(updatedQueue);
        };

        const handleAssignmentUpdate = (assignments) => {
            console.log('📢 ASSIGNMENT_UPDATE event received:', assignments);
            fetchDoctorState();
            fetchDoctors(); // Refresh doctor list to update statuses
        };

        const handleStaffUpdate = () => {
            console.log('📢 STAFF_UPDATE event received');
            fetchDoctorState();
            fetchDoctors();
        };

        socket.on('QUEUE_UPDATE', handleQueueUpdate);
        socket.on('ASSIGNMENT_UPDATE', handleAssignmentUpdate);
        socket.on('STAFF_UPDATE', handleStaffUpdate);

        return () => {
            socket.off('QUEUE_UPDATE', handleQueueUpdate);
            socket.off('ASSIGNMENT_UPDATE', handleAssignmentUpdate);
            socket.off('STAFF_UPDATE', handleStaffUpdate);
        };
    }, [selectedDoctorId]); // Add selectedDoctorId as dependency

    useEffect(() => {
        console.log('🔄 Doctor changed to:', selectedDoctorId);
        fetchDoctorState();
        const interval = setInterval(() => {
            console.log('⏰ Polling doctor state...');
            fetchDoctorState();
        }, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [selectedDoctorId]);

    const handleDoctorChange = (e) => {
        setSelectedDoctorId(e.target.value);
    };

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
                {/* Doctor Selector */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Doctor Login</label>
                    <select
                        value={selectedDoctorId}
                        onChange={handleDoctorChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {doctorsList.map(doc => (
                            <option key={doc._id} value={doc._id}>{doc.name}</option>
                        ))}
                    </select>
                    {currentDoctor && currentDoctor.specialization && currentDoctor.specialization.length > 0 && (
                        <div className="mt-3 text-xs text-slate-500">
                            <span className="font-semibold">Specialization:</span> {currentDoctor.specialization.join(', ')}
                        </div>
                    )}
                </div>

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
                            <span className="font-bold text-slate-800">{doctorsList.filter(d => d.status === 'Busy').length}/{doctorsList.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Critical Cases</span>
                            <span className="font-bold text-red-600">{queue.filter(p => p.priorityLevel === 'Critical').length}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">My Current Patient</h4>
                        {currentDoctor?.currentPatient ? (
                            <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 space-y-3">
                                <div className="text-center border-b border-blue-200 pb-3">
                                    <span className="block font-bold text-blue-800 text-lg">{currentDoctor.currentPatient.name}</span>
                                    <div className="flex justify-center items-center gap-2 mt-1">
                                        <span className="text-xs text-blue-600">{currentDoctor.currentPatient.age} yrs</span>
                                        <span className="text-blue-300">•</span>
                                        <span className="text-xs text-blue-600">{currentDoctor.currentPatient.gender}</span>
                                    </div>
                                    <span className={`inline-block px-2 py-1 mt-2 rounded-full text-xs font-bold ${currentDoctor.currentPatient.priorityLevel === 'Critical' ? 'bg-red-600 text-white' :
                                            currentDoctor.currentPatient.priorityLevel === 'Urgent' ? 'bg-orange-500 text-white' :
                                                'bg-yellow-500 text-white'
                                        }`}>
                                        {currentDoctor.currentPatient.priorityLevel}
                                    </span>
                                </div>

                                {currentDoctor.currentPatient.symptoms && currentDoctor.currentPatient.symptoms.length > 0 && (
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-blue-700 mb-1">Symptoms:</p>
                                        <p className="text-sm text-blue-800">{currentDoctor.currentPatient.symptoms.join(', ')}</p>
                                    </div>
                                )}

                                {currentDoctor.currentPatient.vitals && (
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-blue-700 mb-1">Vitals:</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                                            {currentDoctor.currentPatient.vitals.temperature && (
                                                <div>Temp: {currentDoctor.currentPatient.vitals.temperature}°C</div>
                                            )}
                                            {currentDoctor.currentPatient.vitals.spo2 && (
                                                <div>SpO2: {currentDoctor.currentPatient.vitals.spo2}%</div>
                                            )}
                                            {currentDoctor.currentPatient.vitals.bloodPressure && (
                                                <div className="col-span-2">BP: {currentDoctor.currentPatient.vitals.bloodPressure}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleCompletePatient}
                                    className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 font-medium transition-colors"
                                >
                                    ✅ Complete Consultation
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-500 italic text-sm">
                                {currentDoctor?.status === 'Available'
                                    ? 'Waiting for patient assignment...'
                                    : 'No patient assigned'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
