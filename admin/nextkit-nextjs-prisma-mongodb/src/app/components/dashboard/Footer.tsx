import Link from "next/link";

export const Footer = () => {
  return (
    <>
      <p className="text-base text-center text-bodytext font-medium">
        Design and Developed by{" "}
        <Link
          href="TUMU SOFTWARE"
          className="text-primary font-normal underline hover:text-primaryemphasis"
        >
          TUMU SOFTWARE
        </Link>{" "}
      </p>
    </>
  );
};
