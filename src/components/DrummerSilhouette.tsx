import Img from "@/components/Img";

/** Arte única em PNG transparente: evita montar o percussionista com vários paths SVG. */
export default function DrummerSilhouette({
  variant = "m",
  className = "",
}: {
  variant?: string;
  className?: string;
}) {
  const female = variant === "f";
  return (
    <Img
      src={female ? "/brand/member-silhouettes/drummer-female.png" : "/brand/member-silhouettes/drummer-male.png"}
      alt={`Ilustração de corpo inteiro de ${female ? "uma mulher" : "um homem"} tocando surdo elevado`}
      className={`${className} h-full w-full object-contain`}
    />
  );
}
