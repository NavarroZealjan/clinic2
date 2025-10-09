import React, { forwardRef } from "react";

export const Input = forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
));

Input.displayName = "Input";
