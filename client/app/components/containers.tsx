export function Card(props: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="bg-white shadow-sm rounded-md p-6"
      style={props.style ?? {}}
    >
      {props.children}
    </div>
  );
}

export function CardImage(props: {
  src: string;
  alt: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="bg-white shadow-sm rounded-md relative overflow-hidden w-full h-full">
      <div className="w-1/2 h-full p-6">{props.children}</div>
      <img
        className="w-1/2 h-full rounded-tr-md rounded-br-md absolute top-0 right-0"
        src={props.src}
        alt={props.alt}
        style={props.style ?? {}}
      />
    </div>
  );
}
