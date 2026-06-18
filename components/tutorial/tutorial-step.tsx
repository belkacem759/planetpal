import { Checkbox } from "../ui/checkbox";

export function TutorialStep({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <li className="relative">
      <Checkbox
        className={`absolute top-[3px] mr-2 peer`}
        id={title}
        name={title}
      />
      <label
        className={`relative text-base text-foreground peer-checked:line-through font-medium`}
        htmlFor={title}
      >
        <span className="ml-8">{title}</span>
        <div
          className={`ml-8 text-sm peer-checked:line-through font-normal text-muted-foreground`}
        >
          {children}
        </div>
      </label>
    </li>
  );
}
