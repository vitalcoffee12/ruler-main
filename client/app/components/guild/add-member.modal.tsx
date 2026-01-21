export default function AddMemberModal(props: {}) {
  return (
    <div className="add-member-modal">
      <div className="add-member-modal-content">
        <h2>Add New Member</h2>
        <input
          type="text"
          placeholder="Member Name"
          className="member-name-input"
        />
        <textarea
          placeholder="Member Description"
          className="member-description-input"
        ></textarea>
        <button className="add-member-button">Add Member</button>
      </div>
    </div>
  );
}
