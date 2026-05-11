import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Bell, CheckCircle, AlertTriangle } from "lucide-react";

const CommunityAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/alerts");
                setAlerts(res.data || []);
            } catch (err) {
                console.error("Alerts fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">LOADING ALERTS...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Community Alerts</h2>
                    <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">Stay informed with blood drive alerts and urgent requests</p>
                </div>
                <div className="p-4 bg-red-50 rounded-2xl">
                    <Bell className="text-red-500" size={24} />
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <div key={alert._id} className={`rounded-3xl p-8 border-2 shadow-sm transition-all hover:shadow-md ${
                            alert.severity === "urgent" ? "bg-red-50 border-red-200" :
                            alert.severity === "high" ? "bg-orange-50 border-orange-200" :
                            "bg-yellow-50 border-yellow-200"
                        }`}>
                            <div className="flex items-start gap-6">
                                <div className={`p-3 rounded-2xl ${
                                    alert.severity === "urgent" ? "bg-red-100" :
                                    alert.severity === "high" ? "bg-orange-100" :
                                    "bg-yellow-100"
                                }`}>
                                    {alert.severity === "urgent" ? (
                                        <AlertTriangle className={`${alert.severity === "urgent" ? "text-red-600" : alert.severity === "high" ? "text-orange-600" : "text-yellow-600"}`} size={24} />
                                    ) : (
                                        <Bell className={`${alert.severity === "urgent" ? "text-red-600" : alert.severity === "high" ? "text-orange-600" : "text-yellow-600"}`} size={24} />
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{alert.title}</h3>
                                        <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${
                                            alert.severity === "urgent" ? "bg-red-200 text-red-700" :
                                            alert.severity === "high" ? "bg-orange-200 text-orange-700" :
                                            "bg-yellow-200 text-yellow-700"
                                        }`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 font-medium mb-4">{alert.description}</p>
                                    
                                    {alert.location && (
                                        <div className="mb-4 p-3 bg-white rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-500 font-bold">Location: <span className="text-gray-900">{alert.location}</span></p>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 font-medium">
                                            Posted: {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        {alert.status === "active" && (
                                            <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                <CheckCircle size={14} /> Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200 shadow-sm">
                        <div className="flex flex-col items-center gap-4">
                            <AlertCircle size={40} className="text-gray-200" />
                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No active alerts at the moment</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityAlerts;
