import React from "react";
import { User, Mail, Phone, MapPin, Camera } from "lucide-react";

const UserProfile = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h2>
        <p className="text-zinc-500">Quản lý thông tin cá nhân và bảo mật.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center text-2xl font-bold text-zinc-400 mb-2">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <button className="absolute bottom-2 right-0 p-1.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-lg font-medium">{user.name}</h3>
          <p className="text-zinc-500">{user.email}</p>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="tel"
                  defaultValue="0901234567"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm bg-zinc-50 text-zinc-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Địa chỉ
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                defaultValue="Đà Nẵng, Việt Nam"
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
