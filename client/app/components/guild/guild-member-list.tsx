import { useModal } from "~/hooks/use-modal.hook";
import AddMemberModal from "./add-member.modal";

export default function GuildMemberList(props: {
  guildCode: string;
  guildName: string;
  members: { userId: string; name: string; icon: string }[];
}) {
  const { Modal, openModal, closeModal } = useModal();

  return (
    <>
      <div>
        <div className="flex justify-end mb-2 border-b pb-2 border-stone-200">
          <div
            className="material-symbols-outlined w-10 h-10 hover:bg-stone-100 rounded-lg p-2 cursor-pointer text-stone-600"
            onClick={openModal}
          >
            person_add
          </div>
          <div className="material-symbols-outlined w-10 h-10 hover:bg-stone-100 rounded-lg p-2 cursor-pointer text-stone-600">
            settings
          </div>
        </div>
        <div>
          {props.members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center mb-2 cursor-pointer hover:bg-stone-100 rounded-lg p-2"
            >
              <img
                src={member.icon}
                alt={member.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      </div>
      <Modal>
        <AddMemberModal
          guildCode={props.guildCode}
          guildName={props.guildName}
        />
      </Modal>
    </>
  );
}
