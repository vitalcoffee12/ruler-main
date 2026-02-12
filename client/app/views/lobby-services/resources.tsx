import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ServiceHeader from "~/components/lobby-services/service-header";
import { UserContext } from "~/contexts/userContext";
import { getRequest, postRequest } from "~/request";

interface ResourceItemProps {
  id: number;
  code: string;
  name: string;
  description: string;
  imagePath?: string;
  generativeLevel?: number;
  type?: string;
  ownerId?: number;
  ownerCode?: string;
  distributors?: string[];
  tags?: string[];
  visibility?: "public" | "private" | "unlisted";
  downloadCount?: number;
  favoriteCount?: number;
  rating?: number;
  reviews?: number;
  version?: number;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function Resources() {
  const user = useContext(UserContext);
  const [featuredResources, setFeaturedResources] = useState<
    ResourceItemProps[]
  >([]);
  const [latestResources, setLatestResources] = useState<ResourceItemProps[]>(
    [],
  );

  const onClickPublishNewResource = async () => {
    await postRequest("/resource/upload", {
      writer: { userId: user.id!, userCode: user.code! },
      resourceData: {
        name: "BiD SRD",
        description: "BiD System Reference Document",
        filePath: "/markdown/Blades-in-the-Dark-SRD.md",
      },
    });
  };

  const fetchResources = async () => {
    // Fetch featured resources
    // const featuredResponse = await postRequest("/resource/featured", {});
    // setFeaturedResources(featuredResponse.data || []);
    // Fetch latest resources
    const latestResponse = await getRequest("/resource", {
      userId: user?.id,
      userCode: user?.code,
    });
    setLatestResources(latestResponse.data.responseObject || []);
    setFeaturedResources(latestResponse.data.responseObject.slice(0, 5));
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="h-full min-h-full box-border flex flex-col">
      <div className="flex items-center justify-between border-b border-stone-200 mb-4 h-16">
        <ServiceHeader icon="book_4" />
        <div>
          <div
            className="flex items-center p-3 gap-2 cursor-pointer hover:bg-stone-100 rounded-md m-2 transition duration-200"
            // onClick={onClickPublishNewResource}
          >
            <span className="material-symbols-outlined">add</span>
            <div>Publish New Resource</div>
          </div>
        </div>
      </div>
      <div
        className="block overflow-y-auto no-scrollbar"
        style={{
          height: `calc(100% - var(--spacing) * 16)`,
        }}
      >
        <div id="featured-resources" className="p-4">
          <h2 className="text-2xl mb-4">Featured Resources</h2>
          <div className="flex gap-4 overflow-x-auto min-w-full py-3">
            {featuredResources.map((resource) => (
              <ResourceItem key={resource.code} resource={resource} />
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <ul className="flex gap-4 text-stone-500 cursor-pointer hover:text-stone-700 transition-colors duration-200">
              <li className="material-symbols-outlined">arrow_back</li>
              <li className="material-symbols-outlined">arrow_forward</li>
            </ul>
          </div>
        </div>
        <div id="recently-uploaded" className="p-4">
          <h2 className="text-2xl mb-4">Latest Resources</h2>
          <div className="flex gap-4 overflow-x-auto min-w-full py-3">
            {latestResources.map((resource) => (
              <ResourceItem key={resource.code} resource={resource} />
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <ul className="flex gap-4 text-stone-500 cursor-pointer hover:text-stone-700 transition-colors duration-200">
              <li className="material-symbols-outlined">arrow_back</li>
              <li className="material-symbols-outlined">arrow_forward</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceItem(props: { resource: ResourceItemProps }) {
  const nav = useNavigate();
  return (
    <div
      className="relative border border-stone-200 rounded-lg p-4 mb-4 w-80 h-120 duration-200 bg-cover bg-center bg-no-repeat flex flex-col justify-end text-white overflow-hidden hover:shadow-lg cursor-pointer hover:translate-y-[calc(-2%)]"
      style={{
        backgroundImage: `url(${props.resource.imagePath})`,
      }}
      onClick={() => nav(`/game/resources/detail/${props.resource.id}`)}
    >
      <div className="absolute bg-black opacity-75 bottom-[calc(-5%)] left-[calc(-10%)] h-30 blur-sm w-[120%]"></div>
      <div className="absolute bg-white opacity-75 top-3 left-3 text-stone-900 text-xs rounded-md px-2 py-1">
        {props.resource.type}
      </div>
      <div className="absolute bottom-[5%] left-[5%] w-[90%]">
        <h3 className="text-lg font-semibold mb-2">{props.resource.name}</h3>
        <p className="text-stone-100">{props.resource.description}</p>
      </div>
    </div>
  );
}
