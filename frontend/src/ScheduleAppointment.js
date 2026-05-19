import React, { useState } from "react";
import { Calendar } from "lucide-react";
import axios from "axios";
import { useToast } from "./context/ToastContext";


export default function ScheduleAppointment({ userId, bloodGroup, onSuccess }) {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [canBook, setCanBook] = useState(true);
  const [eligibilityMsg, setEligibilityMsg] = useState("");
  const { showToast } = useToast();

  // Check eligibility on mount
  React.useEffect(() => {
    axios.get(`http://localhost:5000/api/donor/latest-appointment?userId=${userId}`)
      .then(res => {
        if (res.data?.appointment) {
          const status = res.data.appointment.status;
          const lastDate = new Date(res.data.appointment.date);
          const now = new Date();
          
          // Calculate eligibility date (30 days after last approved/completed)
          const nextEligibleDate = new Date(lastDate);
          nextEligibleDate.setDate(nextEligibleDate.getDate() + 30);

          if (status === 'completed' || status === 'fulfilled') {
            if (now < nextEligibleDate) {
              const diffTime = nextEligibleDate - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setEligibilityMsg(`You can only schedule a new donation 30 days after your last completed donation. Please wait ${diffDays} more days until ${nextEligibleDate.toLocaleDateString()}.`);
              setCanBook(false);
            } else {
              setEligibilityMsg("");
              setCanBook(true);
            }
          } else if (status === 'approved') {
            setEligibilityMsg("Your appointment is approved! You cannot book another one until this one is completed.");
            setCanBook(false);
          } else if (status === 'scheduled') {
            setEligibilityMsg("You already have a pending appointment. Please wait for approval or completion.");
            setCanBook(false);
          } else if (status === 'cancelled' || status === 'rejected') {
            setEligibilityMsg("Your last request was rejected. You can schedule a new appointment now.");
            setCanBook(true);
          } else {
            setEligibilityMsg("");
            setCanBook(true);
          }
        } else {
          setEligibilityMsg("");
          setCanBook(true);
        }
        setEligibilityChecked(true);
      })
      .catch(() => {
        setEligibilityMsg("");
        setCanBook(true);
        setEligibilityChecked(true);
      });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canBook) {
      setError(eligibilityMsg || "You are not eligible to book an appointment.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/donor/appointment", {
        userId,
        date,
        notes,
        bloodGroup
      });
      setDate("");
      setNotes("");
      if (onSuccess) onSuccess();
      showToast("Appointment scheduled successfully!", 'success');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to schedule appointment");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 mt-8">
      <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Schedule New Appointment</h2>
      {eligibilityChecked && eligibilityMsg && (
        <div className="text-red-600 font-semibold mb-2">{eligibilityMsg}</div>
      )}
      <div>
        <label className="block font-bold text-red-600 dark:text-red-400 mb-1">Your Blood Group</label>
        <input type="text" value={bloodGroup} readOnly className="w-full p-2 rounded border-2 border-red-400 dark:border-red-600 bg-red-50 dark:bg-gray-900 text-red-700 dark:text-red-300 font-bold cursor-not-allowed text-lg" />
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Date</label>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pl-10"
            id="appointment-date"
            disabled={!canBook}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => document.getElementById('appointment-date').showPicker && document.getElementById('appointment-date').showPicker()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 bg-transparent border-none p-0 m-0 cursor-pointer"
            style={{ outline: 'none' }}
            disabled={!canBook}
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any pre-existing conditions or notes?" className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-[80px]" disabled={!canBook} />
      </div>
      {error && <div className="text-red-600 font-semibold">{error}</div>}
      <button type="submit" disabled={loading || !canBook} className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition w-full mt-2 ${!canBook ? 'opacity-50 cursor-not-allowed' : ''}`}>{loading ? "Scheduling..." : "Schedule Appointment"}</button>
    </form>
  );
}
