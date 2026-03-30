import { PlusIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useRef, useState } from "react";
import { BASE_URL } from "~/axios-instance";
import { AuthContext } from "~/contexts/authContext";

import useLoading from "~/hooks/use-loading.hook";
import useRequest from "~/hooks/use-request.hook";

export default function CreateGuildModal(props: {
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { auth } = useContext(AuthContext);
  const [iconHovered, setIconHovered] = useState(false);
  const [fileHovered, setFileHovered] = useState(false);
  const [filePreview, setFilePreview] = useState<string>("asdfs");
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [loading, setIsLoading] = useLoading();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);

  const [data, setData] = useState({
    name: "",
    iconPath: "",
    description: "",
    attachment: null,
  });

  const reqCreateGuild = useRequest("/guild/create", "post");

  const handleCreateGuild = async () => {
    try {
      await reqCreateGuild.sendRequest({
        authorized: true,
        body: {
          ...data,
          ownerId: auth.id,
        },
      });
      props.onClose();
      props.onRefresh();
    } catch (ex) {
      //handle error
    }
    setIsLoading(false);
    props.onClose();
  };

  useEffect(() => {
    if (fileRef.current) {
      if (fileRef.current.files) {
        const file = fileRef.current.files[0];
        if (file) {
          setFilePreview(file.name);
        }
      }
    }
  }, [fileRef.current]);

  return (
    <div className="flex flex-col min-w-[300px] min-h-[200px]">
      {loading}
      <form
        encType="multipart/form-data"
        method="post"
        action={`${BASE_URL}/guild/create`}
      >
        <div>
          <h2 className="text-lg mb-4">Create a New Guild</h2>
          <div className="text-sm text-stone-600 mb-4">
            Create a New Guild for Unique games, you can change it anytime.
          </div>
          <div
            className="w-24 h-24 mb-4 border-3 border-stone-300 border-dotted flex justify-center items-center rounded-xl cursor-pointer hover:border-lime-700"
            onMouseEnter={() => setIconHovered(true)}
            onMouseLeave={() => setIconHovered(false)}
          >
            <div
              className={`w-full h-full text-lime-700 flex justify-center items-center transition duration-200 ${iconHovered ? "opacity-100" : "opacity-0"}`}
            >
              <PlusIcon width={64} height={64} />
            </div>
            <img src={imagePreview} />
          </div>
          <h3 className="mb-2">
            Guild Name <span className="text-red-600">*</span>
          </h3>
          <input
            name="name"
            type="text"
            placeholder="Give your guild a name"
            value={data.name}
            onChange={(e) => {
              setData({ ...data, name: e.target.value });
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleCreateGuild();
              }
            }}
            className="border border-stone-300 rounded px-2 py-2 mb-4 w-full text-sm"
          />

          <h3 className="mb-2">Description</h3>
          <textarea
            name="description"
            placeholder="Give us your game world concept"
            value={data.description}
            rows={5}
            onChange={(e) => {
              setData({ ...data, description: e.target.value });
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleCreateGuild();
              }
            }}
            className="border border-stone-300 rounded px-2 py-2 mb-2 w-full text-sm"
            style={{ resize: "none" }}
          />
          <p className="text-sm mb-1">
            You can attach a file for more world details
          </p>
          <div
            className="border-3 border-dotted border-stone-300 rounded-lg px-2 py-2 mb-4 w-full text-sm flex justify-center items-center h-30 cursor-pointer hover:border-lime-700 transition duration-140"
            onMouseOver={() => setFileHovered(true)}
            onMouseLeave={() => setFileHovered(false)}
          >
            <div className="text-center text-stone-800 mt-3">
              Browse file
              <p className="italic text-stone-400 text-sm">
                .md .txt .json .xml are allowed.
              </p>
              <div
                className="material-symbols-outlined text-lime-700 mt-3 transition duration-150"
                style={{
                  fontSize: "2rem",
                  transform: fileHovered ? "scale(1.4)" : "",
                }}
              >
                upload
              </div>
            </div>
          </div>
          <input type="file" id="attachment" hidden ref={imageRef} />
          <input type="file" id="attachment" hidden ref={fileRef} />
          <div className="flex justify-between w-lg">
            <div className="text-xs text-stone-500 mb-4">
              By creating a guild, you agree to Ruler's{" "}
              <span className="text-lime-600 italic cursor-pointer hover:underline">
                Community Guidelines
              </span>
            </div>
            <button
              type="submit"
              className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700 transition duration-200 active:scale-95 cursor-pointer"
              // onClick={async () => await handleCreateGuild()}
            >
              Create Guild
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
