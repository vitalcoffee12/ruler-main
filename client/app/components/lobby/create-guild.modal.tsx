import { PlusIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useRef, useState } from "react";
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
  const [filePreview, setFilePreview] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [loading, setIsLoading] = useState<boolean>(false);
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
    setIsLoading(true);
    try {
      const formdata = new FormData();
      formdata.append("ownerId", auth.id.toString());
      formdata.append("name", data.name);
      formdata.append("description", data.description);
      if (imageRef.current && imageRef.current.files)
        formdata.append("iconPath", imageRef.current?.files[0]);
      if (fileRef.current && fileRef.current.files)
        formdata.append("attachment", fileRef.current?.files[0]);

      await reqCreateGuild.sendRequest({
        authorized: true,
        body: formdata,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (ex) {
    } finally {
      setIsLoading(false);
      props.onClose();
      props.onRefresh();
    }
  };

  useEffect(() => {
    if (imageRef.current) {
      if (imageRef.current.files) {
        const file = imageRef.current.files[0];
        if (file) {
          setImagePreview(URL.createObjectURL(file));
        }
      }
    }
  }, [imageRef.current?.files]);

  useEffect(() => {
    if (fileRef.current) {
      if (fileRef.current.files) {
        const file = fileRef.current.files[0];
        if (file) {
          setFilePreview({ name: file.name, size: file.size });
        }
      }
    }
  }, [fileRef.current?.files]);

  return (
    <div className="flex flex-col min-w-[300px] min-h-[200px]">
      <div>
        <h2 className="text-lg mb-4">Create a New Guild</h2>
        <div className="text-sm text-stone-600 mb-4">
          Create a New Guild for Unique games, you can change it anytime.
        </div>
        <div
          className="relative w-24 h-24 mb-4 border-3 border-stone-300 border-dotted flex justify-center items-center rounded-xl cursor-pointer hover:border-lime-700 overflow-hidden"
          onMouseEnter={() => setIconHovered(true)}
          onMouseLeave={() => setIconHovered(false)}
          onClick={(e) => {
            imageRef.current?.click();
          }}
        >
          <img src={imagePreview} />
          <div
            className={`absolute top-0 left-0 w-full h-full text-lime-700 flex justify-center items-center transition duration-200 ${iconHovered ? "opacity-100" : "opacity-0"}`}
          >
            <PlusIcon width={64} height={64} />
          </div>
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
        {filePreview && (
          <div className="flex items-center w-full h-full no-select gap-2 rounded border border-stone-300 p-4 mb-4">
            <span className="material-symbols-outlined">news</span>
            <div className="flex justify-between w-full">
              <p>
                {filePreview.name}
                <span className="ml-4 text-xs rounded p-1 bg-stone-100">
                  {filePreview.size / 1000}
                </span>
                <span className="ml-1 text-xs">kb</span>
              </p>
              <span
                className="material-symbols-outlined text-rose-700 cursor-pointer active:scale-90 transition duration-140"
                onClick={() => {
                  setFilePreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                close
              </span>
            </div>
          </div>
        )}
        {!filePreview && (
          <div
            className="border-3 border-dotted border-stone-300 rounded-lg px-2 py-2 mb-4 w-full text-sm flex justify-center items-center h-30 cursor-pointer hover:border-lime-700 transition duration-140"
            onMouseOver={() => setFileHovered(true)}
            onMouseLeave={() => setFileHovered(false)}
            onClick={() => {
              fileRef.current?.click();
            }}
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
        )}
        <input type="number" name="ownerId" hidden value={auth.id} />
        <input
          type="file"
          name="iconPath"
          hidden
          ref={imageRef}
          accept=".jpg, .png, .jpeg, .gif"
        />
        <input
          type="file"
          name="attachment"
          hidden
          ref={fileRef}
          accept=".md, .txt"
        />
        <div className="flex justify-between w-lg">
          <div className="text-xs text-stone-500 mb-4">
            By creating a guild, you agree to Ruler's{" "}
            <span className="text-lime-600 italic cursor-pointer hover:underline">
              Community Guidelines
            </span>
          </div>
          <button
            type="submit"
            className={`text-white px-4 py-2 rounded transition duration-200 flex items-center gap-2 ${loading ? "bg-stone-600" : "bg-lime-600 hover:bg-lime-700 active:scale-95 cursor-pointer"}`}
            onClick={async () => {
              if (loading) return;
              await handleCreateGuild();
            }}
          >
            <span className="material-symbols-outlined">
              {loading ? "progress_activity" : "more_horiz"}
            </span>
            Create Guild
          </button>
        </div>
      </div>
    </div>
  );
}
