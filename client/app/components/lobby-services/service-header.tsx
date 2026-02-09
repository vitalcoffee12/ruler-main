export default function ServiceHeader(props: { icon: string }) {
  return (
    <div className="p-3 text-xl font-semibold material-symbols-outlined">
      {props.icon}
    </div>
  );
}
