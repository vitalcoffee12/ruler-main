export default function CreateGuildModal(props: {}) {
  return (
    <div className="create-guild-modal">
      <div className="create-guild-modal-content">
        <h2>Create a New Guild</h2>
        <input
          type="text"
          placeholder="Guild Name"
          className="guild-name-input"
        />
        <textarea
          placeholder="Guild Description"
          className="guild-description-input"
        ></textarea>
        <button className="create-guild-button">Create Guild</button>
      </div>
    </div>
  );
}
