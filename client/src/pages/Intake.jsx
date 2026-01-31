import React, { useState } from 'react';
import api from '../services/api';
import { UserPlus, Save, AlertCircle } from 'lucide-react';

const Intake = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        symptoms: [],
        temperature: '',
        spo2: '',
        bp: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Parse symptoms and vitals
            const payload = {
                name: formData.name,
                age: Number(formData.age),
                gender: formData.gender,
                symptoms: formData.symptoms,
                vitals: {
                    temperature: Number(formData.temperature),
                    spo2: Number(formData.spo2),
                    bloodPressure: formData.bp
                }
            };

            await api.post('/patients/intake', payload);
            setMessage({ type: 'success', text: 'Patient registered successfully!' });
            setFormData({
                name: '', age: '', gender: 'Male', symptoms: [], temperature: '', spo2: '', bp: ''
            });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to register patient.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <UserPlus size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">New Patient Intake</h2>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    <AlertCircle size={20} />
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Age</label>
                        <input
                            type="number"
                            name="age"
                            required
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: 45"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Symptoms</label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                        {[
                            'Chest Pain', 'Difficulty Breathing', 'Severe Bleeding', 'Unconscious', 'Stroke Symptoms',
                            'High Fever', 'Abdominal Pain', 'Vomiting', 'Broken Bone',
                            'Headache', 'Dizziness', 'Cough', 'Sore Throat', 'Fatigue'
                        ].map((symptom) => (
                            <label key={symptom} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                                <input
                                    type="checkbox"
                                    checked={formData.symptoms.includes(symptom)}
                                    onChange={(e) => {
                                        const { checked } = e.target;
                                        setFormData(prev => ({
                                            ...prev,
                                            symptoms: checked
                                                ? [...prev.symptoms, symptom]
                                                : prev.symptoms.filter(s => s !== symptom)
                                        }));
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">{symptom}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Temp (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            name="temperature"
                            value={formData.temperature}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                            placeholder="37.5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">SpO2 (%)</label>
                        <input
                            type="number"
                            name="spo2"
                            value={formData.spo2}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                            placeholder="98"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">BP (mmHg)</label>
                        <input
                            type="text"
                            name="bp"
                            value={formData.bp}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                            placeholder="120/80"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                    {loading ? <span>Processing...</span> : (
                        <>
                            <Save size={20} />
                            <span>Register Patient</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Intake;
