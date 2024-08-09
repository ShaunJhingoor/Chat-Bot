"use client";
export default function Login() {
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center py-[12vh] lg:gap-[4vh] gap-[8vh]">
        <div>
          <h1 className="font-bold drop-shadow-lg lg:text-[8vh] text-[6vh]">React Helper</h1>
          <h3 className="lg:text-[1.5vh] lg:py-[3vh] text-center text-[1.5vh] py-[1vh]">
            AI Chat Bot designed to 10x your React workflow.
          </h3>
        </div>

        <img className="lg:w-[20vh] w-[15vh] animate-customSpin" src="/images/react.svg"></img>

        <div className="group border-[1px] hover:border-[#fff] border-[#5B5B5B] rounded-full">
          <button className="group-hover:bg-[#5B5B5B] bg-[#fff] rounded-full px-[4vh] py-[1vh] text-[#5B5B5B] transition-all ease-in">
            <a className="group-hover:text-[#fff] capitalize lg:text-[1.5vh] text-[2vh]" href={"/api/auth/signin"}>
              sign in with github
            </a>
          </button>
        </div>

        <footer className="text-[#5B5B5B] w-[80%] py-[2vh] absolute bottom-0 text-[1.25vh] leading-4 text-center">
        By clicking “Sign in with Github” you agree to our Terms of Use and Privacy Policy (We have neither)
        </footer>
      </div>
    </>
  );
}
