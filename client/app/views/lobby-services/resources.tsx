import { useContext, useState } from "react";
import ServiceHeader from "~/components/lobby-services/service-header";
import { UserContext } from "~/contexts/userContext";
import { postRequest } from "~/request";

interface ResourceItemProps {
  code: string;
  name: string;
  description: string;
  path: string;
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
  // useEffect(() => {}, []);
  return (
    <div className="h-full min-h-full box-border flex flex-col">
      <div className="flex items-center justify-between border-b border-stone-200 mb-4 h-16">
        <ServiceHeader icon="book_4" />
        <div>
          <div
            className="flex items-center p-3 gap-2 cursor-pointer hover:bg-stone-100 rounded-md m-2 transition duration-200"
            onClick={onClickPublishNewResource}
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
          <div className="flex gap-4 overflow-x-auto min-w-full">
            {featuredResources.map((resource) => (
              <ResourceItem
                key={resource.code}
                name={resource.name}
                description={resource.description}
              />
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
          <div className="flex gap-4 overflow-x-auto min-w-full">
            {latestResources.map((resource) => (
              <ResourceItem
                key={resource.code}
                name={resource.name}
                description={resource.description}
              />
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

function ResourceItem(props: { name: string; description: string }) {
  return (
    <div className="border border-stone-200 rounded-lg p-4 mb-4 w-80 h-120 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-2">{props.name}</h3>
      <p className="text-stone-600">{props.description}</p>
    </div>
  );
}
