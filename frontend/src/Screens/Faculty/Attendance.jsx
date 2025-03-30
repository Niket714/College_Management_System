import React, { useState } from "react";
import Heading from "../../components/Heading";
import AddAttendance from "./Attendance/FacultyAttendance"
import ViewAttendance from "./Attendance/FacultyViewAttendence";

const Attendance = () => {
  const [selected, setSelected] = useState("add");

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Attendances" />
        <div className="flex justify-end items-center w-full">
          <button
            className={`${
              selected === "add" && "border-b-2"
            } border-blue-500 px-4 py-2 text-black rounded-sm mr-6`}
            onClick={() => setSelected("add")}
          >
            Mark Attendance
          </button>
          <button
            className={`${
              selected === "view" && "border-b-2"
            } border-blue-500 px-4 py-2 text-black rounded-sm`}
            onClick={() => setSelected("view")}
          >
            View Attendance
          </button>
        </div>
      </div>
      {selected === "add" && <AddAttendance />}
      {selected === "view" && <ViewAttendance />}
    </div>
  );
};

export default Attendance;
