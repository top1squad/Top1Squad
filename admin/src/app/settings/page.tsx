"use client";

import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = [
    "General",
    "Tournament",
    "Notifications",
    "Security",
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <AdminSidebar />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-gray-400">
            Manage your tournament platform settings.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">

          {/* Settings Navigation */}
          <div className="h-fit rounded-xl border border-white/10 bg-[#151515] p-3">

            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`mb-1 w-full rounded-lg px-4 py-3 text-left text-sm transition ${
                  activeTab === tab
                    ? "bg-orange-500 text-black font-semibold"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}

          </div>

          {/* Settings Content */}
          <div className="rounded-xl border border-white/10 bg-[#151515]">

            {/* GENERAL */}
            {activeTab === "General" && (
              <div>

                <div className="border-b border-white/10 p-6">
                  <h2 className="text-xl font-semibold">
                    General Settings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Basic information about your tournament platform.
                  </p>
                </div>

                <div className="space-y-6 p-6">

                  <InputField
                    label="Platform Name"
                    value="Battle Arena"
                  />

                  <InputField
                    label="Admin Email"
                    value="admin@battlearena.com"
                    type="email"
                  />

                  <InputField
                    label="Support Email"
                    value="support@battlearena.com"
                    type="email"
                  />

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Platform Description
                    </label>

                    <textarea
                      rows={4}
                      defaultValue="BGMI and Free Fire tournament platform."
                      className="w-full resize-none rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none focus:border-orange-500"
                    />
                  </div>

                  <SaveButton />

                </div>

              </div>
            )}

            {/* TOURNAMENT */}
            {activeTab === "Tournament" && (
              <div>

                <div className="border-b border-white/10 p-6">
                  <h2 className="text-xl font-semibold">
                    Tournament Settings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure default tournament behavior.
                  </p>
                </div>

                <div className="space-y-6 p-6">

                  <InputField
                    label="Default Team Size"
                    value="4"
                    type="number"
                  />

                  <InputField
                    label="Default Maximum Teams"
                    value="64"
                    type="number"
                  />

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Default Game
                    </label>

                    <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none focus:border-orange-500">
                      <option>BGMI</option>
                      <option>Free Fire</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">
                      Default Tournament Status
                    </label>

                    <select className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none focus:border-orange-500">
                      <option>Upcoming</option>
                      <option>Draft</option>
                    </select>
                  </div>

                  <Toggle
                    title="Allow Team Registration"
                    description="Users can register their teams in tournaments."
                    defaultChecked
                  />

                  <Toggle
                    title="Show Room ID Automatically"
                    description="Room information can be shown to registered players."
                  />

                  <SaveButton />

                </div>

              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "Notifications" && (
              <div>

                <div className="border-b border-white/10 p-6">
                  <h2 className="text-xl font-semibold">
                    Notification Settings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Control platform notifications.
                  </p>
                </div>

                <div className="space-y-5 p-6">

                  <Toggle
                    title="Tournament Announcements"
                    description="Notify users when a tournament is announced."
                    defaultChecked
                  />

                  <Toggle
                    title="Match Announcements"
                    description="Notify registered players about match updates."
                    defaultChecked
                  />

                  <Toggle
                    title="Winner Announcements"
                    description="Notify users when tournament results are published."
                    defaultChecked
                  />

                  <Toggle
                    title="Important Announcements"
                    description="Send important platform updates."
                    defaultChecked
                  />

                  <SaveButton />

                </div>

              </div>
            )}

            {/* SECURITY */}
            {activeTab === "Security" && (
              <div>

                <div className="border-b border-white/10 p-6">
                  <h2 className="text-xl font-semibold">
                    Security Settings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage your admin account security.
                  </p>
                </div>

                <div className="space-y-6 p-6">

                  <InputField
                    label="Current Password"
                    value=""
                    type="password"
                    placeholder="Enter current password"
                  />

                  <InputField
                    label="New Password"
                    value=""
                    type="password"
                    placeholder="Enter new password"
                  />

                  <InputField
                    label="Confirm Password"
                    value=""
                    type="password"
                    placeholder="Confirm new password"
                  />

                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">

                    <p className="text-sm font-medium text-yellow-400">
                      Admin Security
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Password changes and authentication will be connected
                      to the backend later.
                    </p>

                  </div>

                  <SaveButton />

                </div>

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}

/* Input */

function InputField({
  label,
  value,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-400">
        {label}
      </label>

      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-orange-500"
      />
    </div>
  );
}

/* Toggle */

function Toggle({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#101010] p-4">

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled
            ? "bg-orange-500"
            : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

    </div>
  );
}

/* Save Button */

function SaveButton() {
  return (
    <div className="flex justify-end border-t border-white/10 pt-5">

      <button className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-black hover:bg-orange-400">
        Save Changes
      </button>

    </div>
  );
}