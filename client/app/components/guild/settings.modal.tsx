export default function SettingsModal(props: {}) {
  return (
    <div className="settings-modal">
      <div className="settings-modal-content">
        <h2>Guild Settings</h2>
        <input
          type="text"
          placeholder="Guild Name"
          className="guild-name-input"
        />
        <textarea
          placeholder="Guild Description"
          className="guild-description-input"
        ></textarea>
        <button className="save-settings-button">Save Settings</button>
      </div>
    </div>
  );
}
