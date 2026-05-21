import inventoryUtils from './inventoryUtils.js';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import { sendEmail } from '../config/emailConfig.js';

// Mark request as completed and decrease inventory
export const completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(403).json({ error: 'Cannot complete non-pending requests' });
    }
    request.status = 'completed';
    await request.save();
    // Decrease inventory for requested blood group
    await inventoryUtils.decreaseInventory(request.bloodGroup, request.units);
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
export const createRequest = async (req, res) => {
  try {
    const { userId, requestFor, bloodGroup, units, patientName, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let finalBloodGroup = bloodGroup;
    let finalPatientName = patientName;

    if (requestFor === 'self') {
      finalBloodGroup = user.bloodGroup;
      finalPatientName = user.fullName;
    }

    const newRequest = new BloodRequest({
      recipient: userId,
      requestFor,
      bloodGroup: finalBloodGroup,
      units,
      patientName: finalPatientName,
      reason,
      status: 'pending'
    });

    await newRequest.save();

    const adminEmail = 'bloodbankteam2023@gmail.com';

    // Send email notification for new blood request to the recipient
    if (user.email) {
      try {
        const subject = 'Blood Request Submitted Successfully';
        const text = `Hello ${user.fullName},\n\nYour blood request for ${units} unit(s) of ${finalBloodGroup} blood has been submitted successfully. We will process your request soon.\n\nPatient: ${finalPatientName}\nReason: ${reason}\n\nThank you for using our Blood Bank service.`;
        const html = `<p>Hello ${user.fullName},</p><p>Your blood request for <strong>${units}</strong> unit(s) of <strong>${finalBloodGroup}</strong> blood has been submitted successfully. We will process your request soon.</p><p><strong>Patient:</strong> ${finalPatientName}<br><strong>Reason:</strong> ${reason}</p><p>Thank you for using our Blood Bank service.</p>`;
        const result = await sendEmail(user.email, subject, text, html);
        console.log('Blood request creation email sent to recipient:', result);
      } catch (emailError) {
        console.error('Failed to send blood request creation email to recipient:', emailError);
      }
    }

    // Send email notification to admin for new blood request
    try {
      const adminSubject = 'New Blood Request Submitted';
      const adminText = `A new blood request has been submitted:\n\nRecipient: ${user.fullName} (${user.email})\nRequest For: ${finalPatientName}\nBlood Group: ${finalBloodGroup}\nUnits: ${units}\nReason: ${reason}\n\nPlease review it in the admin panel.`;
      const adminHtml = `<p>A new blood request has been submitted:</p><ul><li><strong>Recipient:</strong> ${user.fullName} (${user.email})</li><li><strong>Request For:</strong> ${finalPatientName}</li><li><strong>Blood Group:</strong> ${finalBloodGroup}</li><li><strong>Units:</strong> ${units}</li><li><strong>Reason:</strong> ${reason}</li></ul><p>Please review it in the admin panel.</p>`;
      const adminResult = await sendEmail(adminEmail, adminSubject, adminText, adminHtml);
      console.log('Blood request notification email sent to admin:', adminResult);
    } catch (adminError) {
      console.error('Failed to send blood request notification email to admin:', adminError);
    }

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};
export const getRequests = async (req, res) => {
  try {
    const { userId } = req.query;
    const requests = await BloodRequest.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { requestFor, bloodGroup, units, patientName, reason } = req.body;

    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending') {
      return res.status(403).json({ error: 'Cannot edit completed or cancelled requests' });
    }

    const user = await User.findById(request.recipient);
    
    let finalBloodGroup = bloodGroup;
    let finalPatientName = patientName;

    if (requestFor === 'self') {
      finalBloodGroup = user.bloodGroup;
      finalPatientName = user.fullName;
    }

    request.requestFor = requestFor !== undefined ? requestFor : request.requestFor;
    request.bloodGroup = finalBloodGroup !== undefined ? finalBloodGroup : request.bloodGroup;
    request.units = units !== undefined ? units : request.units;
    request.patientName = finalPatientName !== undefined ? finalPatientName : request.patientName;
    request.reason = reason !== undefined ? reason : request.reason;

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending') {
      return res.status(403).json({ error: 'Cannot delete completed or cancelled requests' });
    }

    await BloodRequest.findByIdAndDelete(id);
    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export default {
  completeRequest,
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest
};
