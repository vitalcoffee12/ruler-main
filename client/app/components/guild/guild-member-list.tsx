import { useModal } from "~/hooks/use-modal.hook";
import AddMemberModal from "./add-member.modal";
import useSocket from "~/hooks/use-socket.hook";
import { useEffect, useState } from "react";
import SettingsModal from "./settings.modal";
import type { Guild, GuildMember } from "../common.interface";

export default function GuildMemberList(props: { guild: Guild }) {
  const [modalType, setModalType] = useState<"invite" | "settings" | null>(
    null,
  );
  const { Modal, openModal, closeModal } = useModal();
  const [members, setMembers] = useState<GuildMember[]>([]);

  const { isConnected, payloads, sendMessage } = useSocket();
  useEffect(() => {
    if (!isConnected) return;
    for (const payload of payloads) {
      if (
        payload.type === "GUILD_MEMBER_LIST_UPDATE" &&
        payload.guildCode === props.guild.code
      ) {
        setMembers(payload.content);
      }
    }
  }, [isConnected, payloads, props.guild.code]);

  return (
    <>
      <div>
        <div className="flex justify-end mb-2 border-b pb-2 border-stone-200">
          <div
            className="material-symbols-outlined w-10 h-10 hover:bg-stone-100 rounded-lg p-2 cursor-pointer text-stone-600"
            onClick={() => {
              setModalType("invite");
              openModal();
            }}
          >
            person_add
          </div>
          <div
            className="material-symbols-outlined w-10 h-10 hover:bg-stone-100 rounded-lg p-2 cursor-pointer text-stone-600"
            onClick={() => {
              setModalType("settings");
              openModal();
            }}
          >
            settings
          </div>
        </div>
        <div>
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center mb-2 cursor-pointer hover:bg-stone-100 rounded-lg p-2"
            >
              <img
                src={member.iconPath}
                alt={member.displayName}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <span>{member.displayName}</span>
            </div>
          ))}
        </div>
      </div>
      <Modal>
        {modalType === "invite" && (
          <AddMemberModal
            guildCode={props.guild.code}
            guildName={props.guild.name}
          />
        )}
        {modalType === "settings" && (
          <SettingsModal
            guildId={props.guild.id}
            guildCode={props.guild.code}
          />
        )}
      </Modal>
    </>
  );
}
