"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

export default function Settings() {
  const initialSettings = [
    {
      id: 1,
      title: "Profile Settings",
      description: "Manage your personal info, avatar, and contact details.",
      fields: [
        { label: "Username", type: "text", value: "JohnDoe" },
        { label: "Email", type: "email", value: "john@example.com" },
        //{ label: "Avatar URL", type: "text", value: "https://example.com/avatar.jpg" },
      ],
    },
    {
      id: 2,
      title: "Account Security",
      description: "Change password, enable 2FA, and review login activity.",
      fields: [
        { label: "Password", type: "password", value: "" },
        { label: "Two-factor authentication", type: "checkbox", value: false },
        // { label: "Active Sessions", type: "text", value: "3 devices" },
      ],
    },
    {
      id: 3,
      title: "Notification Preferences",
      description: "Set how and when you receive notifications.",
      fields: [
        { label: "Email Notifications", type: "checkbox", value: true },
        { label: "Push Notifications", type: "checkbox", value: false },
        { label: "SMS Alerts", type: "checkbox", value: true },
      ],
    },
    {
      id: 4,
      title: "Billing & Subscription",
      description: "View invoices and manage your subscription plan.",
      fields: [
        { label: "Payment Method", type: "text", value: "Visa **** 4242" },
        { label: "Subscription Plan", type: "text", value: "Pro Plan" },
        { label: "Billing History", type: "text", value: "Last payment on Aug 1" },
      ],
    },
    {
      id: 5,
      title: "Data Upload",
      description: "Upload new data and manage your troubleshooting cookbook.",
      fields: [
        { label: "Issue", type: "text", value: "Motor malfunction" },
        { label: "Solution", type: "textarea", value: "1. Replace and verify belt motor\n2.replace conveyor belt motor\n3.check the relay functionality" },
      ],
    },
    {
      id: 6,
      title: "Cookbook Upload",
      description: "Upload new cookbook and manage troubleshooting cookbook.",
      fields: [
        { label: "Title", type: "text", value: "VUM Server error" },
        { label: "Description", type: "textarea", value: "VUM registration issue and etc" },
        { label: "Documentation", type: "file", value: "Last payment on Aug 1" },
      ],
    },
  ];

  const [settings, setSettings] = useState(initialSettings);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch("/api/role", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          setRole(data.role);
        }
      })
      .catch(err => console.error(err));
  }, []);

  if (!role) return <p>Loading...</p>;

  const handleChange = (catId, fieldIndex, newValue, type, file = null) => {
    setSettings((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              fields: cat.fields.map((field, idx) =>
                idx === fieldIndex
                  ? { 
                      ...field, 
                      value: type === "checkbox" ? !field.value : newValue,
                      ...(file && { file }) // store the selected File object
                    }
                  : field
              ),
            }
          : cat
      )
    );
  };

  const handleSubmit = async (category) => {
  if (category.id === 5) {
    const payload = {
      issue: category.fields[0].value || category.fields[0].placeholder || "",
      solution: category.fields[1].value || category.fields[1].placeholder || ""
    };

    try {
      const res = await fetch("/api/upload-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Excel updated! New ID: ${data.message.split(": ")[1]}`);

        // ✅ Clear input values
        const updatedCategory = {
          ...category,
          fields: category.fields.map(f => ({ ...f, value: "" }))
        };

        // ✅ Update state
        setSettings(prev =>
          prev.map(cat => (cat.id === category.id ? updatedCategory : cat))
        );
      } else {
        toast.error("Failed to update Excel: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting form");
    }
  } else if (category.id === 6) {
    // Cookbook upload
    const formData = new FormData();
    formData.append("Title", category.fields[0].value || "");
    formData.append("Description", category.fields[1].value || "");

    const fileField = category.fields.find(f => f.type === "file" && f.value instanceof File);
    if (fileField) {
      formData.append("Documentation", fileField.value);
    }

    try {
      const res = await fetch("/api/upload-cookbook", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Upload successful!`);

        const updatedCategory = {
          ...category,
          fields: category.fields.map(f => ({ ...f, value: "" }))
        };

        setSettings(prev =>
          prev.map(cat => (cat.id === category.id ? updatedCategory : cat))
        );
      } else {
        toast.error("Failed to upload: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting form");
    }
  }
};


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Settings</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(settings) &&
        settings
          .filter(
            (category) =>
              role === "admin" || (category.id !== 5 && category.id !== 6 && category.id !== 3 && category.id !== 4)
          )
          .map((category) => (
          <form
            key={category.id}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(category);
            }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition flex flex-col h-full"
            style={{ minHeight: "400px" }} // optional fixed height
          >
              <div className="flex-grow overflow-y-auto">
                <h2 className="text-xl font-semibold mb-2 text-blue-600">
                  {category.title}
                </h2>
                <p className="text-gray-600 mb-4">{category.description}</p>

              <div className="space-y-3">
                {category.fields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {field.type === "checkbox" ? (
                      <>
                        <input
                          type="checkbox"
                          checked={field.value}
                          required
                          onChange={() =>
                            handleChange(category.id, idx, null, "checkbox")
                          }
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                        />
                        <label className="text-gray-700">{field.label}</label>
                      </>
                    ) : field.type === "textarea" ? (
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <textarea
                          placeholder={field.value || ""}
                          required
                          onChange={(e) =>
                            handleChange(category.id, idx, e.target.value, field.type)
                          }
                          rows={4}
                          className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-y overflow-auto"
                          style={{ padding: "8px", color: "black", border: "solid 1px" }}
                        ></textarea>
                      </div>
                    ) : field.type === "file" ? (
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <input
                          type="file"
                          name="documentation"
                          accept="application/pdf"
                          required
                          onChange={(e) =>
                            handleChange(category.id, idx, e.target.files[0], "file")
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                        />
                      </div>
                    ) : (
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          required
                          placeholder={field.placeholder || field.value}
                          onChange={(e) =>
                            handleChange(category.id, idx, e.target.value, field.type)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          style={{ padding: "8px", color: "black", border: "solid 1px" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-purple-500 text-white py-2 rounded-lg shadow"
              >
                Save
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}

