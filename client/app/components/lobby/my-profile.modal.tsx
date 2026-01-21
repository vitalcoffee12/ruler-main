export default function MyProfileModal(props: {}) {
  return (
    <div className="my-profile-modal">
      <div className="my-profile-modal-content">
        <h2>My Profile</h2>
        <input type="text" placeholder="Username" className="username-input" />
        <textarea placeholder="Bio" className="bio-input"></textarea>
        <button className="save-profile-button">Save Profile</button>
      </div>
    </div>
  );
}
