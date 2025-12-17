"use client";

import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import CardBox from "../shared/CardBox";
import { Button, Checkbox, Label, Spinner, TextInput } from "flowbite-react";
import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Bounce, toast } from "react-toastify";

interface UserInfo {
  email: string;
  password: string;
}

const initialUserInfo: UserInfo = {
  email: "",
  password: "",
};

export const Login = () => {
  const router = useRouter();

  function reducer(
    userInfo: UserInfo,
    action: { type: string; payload: string }
  ) {
    switch (action.type) {
      case "SET_EMAIL":
        return { ...userInfo, email: action.payload };
      case "SET_PASSWORD":
        return { ...userInfo, password: action.payload };
      default:
        return userInfo;
    }
  }

  const [userInfo, dispatch] = useReducer(reducer, initialUserInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  async function handleLogin() {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("userInfo", JSON.stringify(result));
        router.push("/"); // Login sonrası ana sayfaya yönlendir
      } else {
        toast.error(result.error || "Login failed", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          className: "!font-semibold !font-inherit !text-[#EF4444]",
        });
        setIsError(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Internal Server Error", { theme: "light" });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen w-full flex justify-center items-center bg-lightprimary">
      <div className="md:min-w-[400px] min-w-max">
        <CardBox>
          <div className="flex justify-center mb-8">
            <FullLogo />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="email" value="Email" />
                <TextInput
                  id="email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    dispatch({ type: "SET_EMAIL", payload: e.target.value })
                  }
                  placeholder="admin@velora.com"
                  required
                  className={`${isError ? "active-error" : ""}`}
                />
              </div>

              <div>
                <Label htmlFor="password" value="Password" />
                <TextInput
                  id="password"
                  type="password"
                  value={userInfo.password}
                  onChange={(e) =>
                    dispatch({ type: "SET_PASSWORD", payload: e.target.value })
                  }
                  placeholder="admin123"
                  required
                  className={`${isError ? "active-error" : ""}`}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked readOnly />
                <Label htmlFor="remember" className="text-sm">
                  Remember this device
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              color="primary"
              className="w-full mt-6 flex items-center gap-2"
            >
              {isLoading && <Spinner size="sm" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            <p>
              Demo Admin Credentials:
              <br />
              <strong>Email:</strong> admin@velora.com
              <br />
              <strong>Password:</strong> admin123
            </p>
          </div>
        </CardBox>
      </div>
    </div>
  );
};
