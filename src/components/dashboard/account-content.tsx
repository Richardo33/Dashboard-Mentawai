"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { Camera, Check, LockKeyhole, Save, Settings, UserRound } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { defaultUserProfile, initialsForName, type UserProfile } from "@/lib/user-profile";
import { supabase } from "@/lib/supabase/client";

type AccountContentProps = { mode: "profile" | "settings" };

export function AccountContent({ mode }: AccountContentProps) {
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [name, setName] = useState(defaultUserProfile.name);
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase) {
        setProfile(defaultUserProfile);
        setName(defaultUserProfile.name);
        setAvatar(defaultUserProfile.avatar);
        return;
      }

      const { data } = await supabase.auth.getUser();
      const authUser = data.user;
      const metadata = authUser?.user_metadata ?? {};
      const { data: databaseProfile } = authUser
        ? await supabase.from("profiles").select("email, name, role, avatar_path, notifications_enabled").eq("id", authUser.id).maybeSingle()
        : { data: null };
      const current: UserProfile = authUser?.email
        ? {
            ...defaultUserProfile,
            email: authUser.email.toLowerCase(),
            name: databaseProfile?.name || metadata.full_name || metadata.name || defaultUserProfile.name,
            role: databaseProfile?.role === "Operator" || databaseProfile?.role === "Viewer" ? databaseProfile.role : "Administrator",
            avatar: databaseProfile?.avatar_path ?? metadata.avatar_url ?? metadata.picture ?? "",
          }
        : defaultUserProfile;
      setProfile(current);
      setName(current.name);
      setAvatar(current.avatar);
      setNotifications(databaseProfile?.notifications_enabled ?? true);
    };
    void loadProfile();
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

  async function saveProfile() {
    const updated = { ...profile, name: (name.trim() || profile.name).slice(0, 15), avatar };

    if (!supabase) {
      void Swal.fire({ title: "Profil belum tersimpan", text: "Database belum terhubung.", icon: "error", confirmButtonText: "Tutup" });
      return;
    }
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData.user;
    const { error: profileError } = authUser
      ? await supabase.from("profiles").update({ name: updated.name, avatar_path: updated.avatar || null }).eq("id", authUser.id).select("id").single()
      : { error: new Error("Sesi login tidak ditemukan") };
    if (profileError || !authUser) {
      void Swal.fire({ title: "Profil belum tersimpan", text: "Perubahan profil gagal disimpan ke database.", icon: "error", confirmButtonText: "Tutup" });
      return;
    }

    await supabase.auth.updateUser({ data: { full_name: updated.name, name: updated.name, avatar_url: updated.avatar } });
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

  async function toggleNotifications() {
    const next = !notifications;
    const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (!supabase || !data.user) return;
    const { error } = await supabase.from("profiles").update({ notifications_enabled: next }).eq("id", data.user.id);
    if (error) return;
    setNotifications(next);
  }

  return <div className="dashboard-content account-content"><div className="account-heading"><h1>{mode === "profile" ? "Profil" : "Pengaturan"}</h1><p>{mode === "profile" ? "Kelola informasi akun dan identitas yang tampil di dashboard" : "Atur preferensi penggunaan dashboard BAPENDA"}</p></div>{mode === "profile" ? <section className="account-panel profile-settings-panel"><header><div><UserRound size={20} /><div><h2>Informasi Profil</h2><p>Informasi ini digunakan pada header dan profil akun.</p></div></div></header><div className="profile-form"><div className="profile-photo-field"><button type="button" className="profile-large-avatar" onClick={() => document.getElementById("profile-photo-input")?.click()} aria-label="Pilih foto profil">{avatar ? <img src={avatar} alt="Foto profil" /> : initialsForName(name)}</button><label className="profile-photo-button" htmlFor="profile-photo-input"><Camera size={16} />Ganti Foto</label><input id="profile-photo-input" className="profile-photo-input" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif" onChange={changeAvatar} /></div><label className="account-field"><span>Nama</span><input value={name} maxLength={15} onChange={(event) => { setName(event.target.value); dirtyRef.current = true; }} placeholder="Nama pengguna" /></label><label className="account-field"><span>Email</span><input value={profile.email} readOnly /></label><label className="account-field"><span>Role</span><input value={profile.role} readOnly /></label></div><footer className="account-panel-footer"><span className={saved ? "save-confirmed" : ""}>{saved && <Check size={15} />} {saved ? "Profil tersimpan" : "Perubahan tersimpan di akun ini"}</span><button className="primary-action" onClick={saveProfile}><Save size={16} />Simpan Profil</button></footer></section> : <section className="account-panel preferences-panel"><header><div><Settings size={20} /><div><h2>Preferensi Dashboard</h2><p>Sesuaikan notifikasi yang ingin kamu terima.</p></div></div></header><div className="preference-row"><div><strong>Notifikasi Alert Center</strong><p>Tampilkan notifikasi peringatan pada ikon lonceng di header.</p></div><button className={`account-toggle ${notifications ? "is-on" : ""}`} role="switch" aria-checked={notifications} onClick={toggleNotifications}><i /></button></div><div className="preference-row"><div><strong>Keamanan Akun</strong><p>Password dan akses akun dikelola oleh administrator.</p></div><LockKeyhole size={19} className="preference-icon" /></div></section>}</div>;
}
