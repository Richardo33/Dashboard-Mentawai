"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { Camera, Check, LockKeyhole, Save, Settings, UserRound } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { defaultUserProfile, getStoredUserProfile, initialsForName, type UserProfile } from "@/lib/user-profile";

type AccountContentProps = { mode: "profile" | "settings" };

export function AccountContent({ mode }: AccountContentProps) {
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [name, setName] = useState(defaultUserProfile.name);
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const stored = getStoredUserProfile();
    setProfile(stored);
    setName(stored.name);
    setAvatar(stored.avatar);
    setNotifications(window.localStorage.getItem("mentawai-notifications") !== "off");
  }, []);

  useEffect(() => {
    const expectedHash = `#${mode}`;
    const handleHashChange = () => {
      const nextHash = window.location.hash || "#overview";
      if (!dirtyRef.current || nextHash === expectedHash) return;
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${expectedHash}`);
      void Swal.fire({
        title: "Perubahan belum disimpan",
        text: "Perubahan yang kamu buat akan hilang jika berpindah tab sekarang.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Lanjutkan",
        cancelButtonText: "Tetap di sini",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          dirtyRef.current = false;
          window.location.hash = nextHash;
        }
      });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [mode]);

  function saveProfile() {
    const updated = { ...profile, name: (name.trim() || profile.name).slice(0, 15), avatar };
    window.sessionStorage.setItem("mentawai-user", JSON.stringify(updated));
    setProfile(updated);
    dirtyRef.current = false;
    window.dispatchEvent(new CustomEvent("mentawai-user-updated"));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
    void Swal.fire({ title: "Profil tersimpan", text: "Perubahan profil berhasil disimpan.", icon: "success", confirmButtonText: "Tutup" });
  }

  function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      void Swal.fire({ title: "Format tidak didukung", text: "Gunakan gambar JPG, PNG, WEBP, atau GIF.", icon: "error", confirmButtonText: "Tutup" });
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setAvatar(typeof reader.result === "string" ? reader.result : ""); dirtyRef.current = true; };
    reader.readAsDataURL(file);
  }

  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    window.localStorage.setItem("mentawai-notifications", next ? "on" : "off");
  }

  return <div className="dashboard-content account-content"><div className="account-heading"><h1>{mode === "profile" ? "Profil" : "Pengaturan"}</h1><p>{mode === "profile" ? "Kelola informasi akun dan identitas yang tampil di dashboard" : "Atur preferensi penggunaan dashboard BAPENDA"}</p></div>{mode === "profile" ? <section className="account-panel profile-settings-panel"><header><div><UserRound size={20} /><div><h2>Informasi Profil</h2><p>Informasi ini digunakan pada header dan profil akun.</p></div></div></header><div className="profile-form"><div className="profile-photo-field"><button type="button" className="profile-large-avatar" onClick={() => document.getElementById("profile-photo-input")?.click()} aria-label="Pilih foto profil">{avatar ? <img src={avatar} alt="Foto profil" /> : initialsForName(name)}</button><label className="profile-photo-button" htmlFor="profile-photo-input"><Camera size={16} />Ganti Foto</label><input id="profile-photo-input" className="profile-photo-input" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" onChange={changeAvatar} /></div><label className="account-field"><span>Nama</span><input value={name} maxLength={15} onChange={(event) => { setName(event.target.value); dirtyRef.current = true; }} placeholder="Nama pengguna" /></label><label className="account-field"><span>Email</span><input value={profile.email} readOnly /></label><label className="account-field"><span>Role</span><input value={profile.role} readOnly /></label></div><footer className="account-panel-footer"><span className={saved ? "save-confirmed" : ""}>{saved && <Check size={15} />} {saved ? "Profil tersimpan" : "Perubahan tersimpan di akun ini"}</span><button className="primary-action" onClick={saveProfile}><Save size={16} />Simpan Profil</button></footer></section> : <section className="account-panel preferences-panel"><header><div><Settings size={20} /><div><h2>Preferensi Dashboard</h2><p>Sesuaikan notifikasi yang ingin kamu terima.</p></div></div></header><div className="preference-row"><div><strong>Notifikasi Alert Center</strong><p>Tampilkan notifikasi peringatan pada ikon lonceng di header.</p></div><button className={`account-toggle ${notifications ? "is-on" : ""}`} role="switch" aria-checked={notifications} onClick={toggleNotifications}><i /></button></div><div className="preference-row"><div><strong>Keamanan Akun</strong><p>Password dan akses akun dikelola oleh administrator.</p></div><LockKeyhole size={19} className="preference-icon" /></div></section>}</div>;
}
