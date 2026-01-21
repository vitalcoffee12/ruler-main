export default function AddElementModal(props: {}) {
  return (
    <div className="add-element-modal">
      <div className="add-element-modal-content">
        <h2>Add New Element</h2>
        <input
          type="text"
          placeholder="Element Name"
          className="element-name-input"
        />
        <textarea
          placeholder="Element Description"
          className="element-description-input"
        ></textarea>
        <button className="add-element-button">Add Element</button>
      </div>
    </div>
  );
}
