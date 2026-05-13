export default function DonationMaterials() {
  const materials = [
    {
      title: "Blood Donation Process",
      content: "Learn about the step-by-step process of donating blood, from registration to post-donation care."
    },
    {
      title: "Eligibility Requirements",
      content: "Check if you meet the basic requirements: age 18-65, weight 50kg+, good health, etc."
    },
    {
      title: "Preparation Tips",
      content: "Eat healthy, stay hydrated, get good sleep, and avoid certain medications before donation."
    },
    {
      title: "What to Expect",
      content: "Understand the donation experience, duration (about 10-15 minutes), and recovery time."
    },
    {
      title: "Benefits of Donating",
      content: "Save lives, get free health check-up, reduce heart disease risk, and feel good about helping others."
    },
    {
      title: "Common Myths",
      content: "Debunk myths about blood donation: it doesn't hurt much, you can donate every 56 days, etc."
    }
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation Materials</h1>
        <p className="text-gray-600">Educational resources and information for blood donors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{material.title}</h3>
            <p className="text-gray-600">{material.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Important Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-800">Emergency Contact</h3>
            <p className="text-blue-700">Call our helpline: +1-800-BLOOD-HELP</p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Location</h3>
            <p className="text-blue-700">123 Blood Bank Street, City, State 12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}