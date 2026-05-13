import React from 'react';
import { Award, Download, Eye, Star, Shield, Heart } from 'lucide-react';
import jsPDF from 'jspdf';

const Certificates = ({ requests, userName = 'Valued Donor' }) => {
    const completedDonations = requests.filter(r => r.status === 'Completed');
    const totalDonations = completedDonations.length;

    const generateCertificate = (donation) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();

        // Add border
        doc.setLineWidth(5);
        doc.setDrawColor(185, 28, 28); 
        doc.rect(5, 5, width - 10, height - 10);
        
        doc.setLineWidth(1);
        doc.setDrawColor(220, 38, 38); 
        doc.rect(10, 10, width - 20, height - 20);

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        doc.setTextColor(185, 28, 28);
        doc.text('BLOOD DONATION CERTIFICATE', width / 2, 40, { align: 'center' });

        doc.setFontSize(18);
        doc.setTextColor(55, 65, 81);
        doc.setFont('helvetica', 'normal');
        doc.text('This is to certify that', width / 2, 60, { align: 'center' });

        // Name
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(userName.toUpperCase(), width / 2, 80, { align: 'center' });

        // Divider
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(width / 4, 85, (width * 3) / 4, 85);

        // Message
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(`has successfully donated blood and helped save lives`, width / 2, 110, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text(`DONATION DATE: ${new Date(donation.createdAt).toLocaleDateString()}`, width / 2, 130, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(`Location: ${donation.location || 'Red Cross Blood Bank'}`, width / 2, 145, { align: 'center' });

        doc.text('Your contribution is invaluable and will help save many lives.', width / 2, 165, { align: 'center' });

        // Footer signatures
        doc.setLineWidth(0.5);
        doc.line(40, 185, 100, 185);
        doc.line(width - 100, 185, width - 40, 185);
        
        doc.setFontSize(12);
        doc.text('Medical Director', 70, 192, { align: 'center' });
        doc.text('Program Coordinator', width - 70, 192, { align: 'center' });

        doc.save(`Donation_Certificate_${donation._id?.slice(-6) || 'N/A'}.pdf`);
    };

    const achievements = [
        {
            title: "Regular Donor Certificate",
            desc: "Awarded for 10+ donations",
            id: "regular",
            icon: <Star className="text-yellow-500" />,
            badge: "Gold",
            badgeColor: "bg-yellow-100 text-yellow-700",
            target: 10,
            date: "2026-02-15"
        },
        {
            title: "Life Saver Award",
            desc: "For saving 90+ lives",
            id: "lifesaver",
            icon: <Heart className="text-red-500" />,
            badge: "Platinum",
            badgeColor: "bg-purple-100 text-purple-700",
            target: 30, // Updated to 30 as requested 
            date: "2025-11-20"
        },
        {
            title: "Community Hero",
            desc: "Active community participation",
            id: "hero",
            icon: <Shield className="text-blue-500" />,
            badge: "Silver",
            badgeColor: "bg-gray-100 text-gray-700",
            target: 5,
            date: "2025-08-10"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Certificates & Awards</h2>
                <p className="text-gray-500 font-medium">Download and share your donation certificates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {achievements.map((ach) => {
                    const isUnlocked = totalDonations >= ach.target;
                    return (
                        <div key={ach.id} className={`bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center transition-all ${!isUnlocked && 'opacity-60 grayscale'}`}>
                            <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-6">
                                <Award size={32} className="text-yellow-500" />
                            </div>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${ach.badgeColor}`}>
                                {ach.badge}
                            </span>
                            <h3 className="text-lg font-black text-gray-900 mb-1">{ach.title}</h3>
                            <p className="text-xs text-gray-500 mb-2">{ach.desc}</p>
                            <p className="text-[10px] font-bold text-gray-300 mb-6">{ach.date}</p>
                            
                            <div className="flex gap-2 w-full">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 text-xs font-black hover:bg-gray-50 transition-all">
                                    <Eye size={14} /> View
                                </button>
                                <button 
                                    onClick={() => isUnlocked && generateCertificate(completedDonations[0] || {createdAt: new Date()})}
                                    disabled={!isUnlocked}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white text-xs font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    <Download size={14} /> Download
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8">Achievement Progress</h3>
                
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="font-black text-gray-900">Diamond Donor</h4>
                                <p className="text-xs text-gray-500">Donate 20 times to unlock</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-gray-900">{totalDonations}/20</span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{Math.round((totalDonations/20)*100)}% complete</p>
                            </div>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-red-600 rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min((totalDonations/20)*100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificates;