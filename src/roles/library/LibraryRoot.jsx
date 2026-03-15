import { Outlet } from "react-router-dom";
import { LibraryProvider } from "./LibraryContext";

export default function LibraryRoot() {
  return (
    <LibraryProvider>
      <Outlet />
    </LibraryProvider>
  );
}