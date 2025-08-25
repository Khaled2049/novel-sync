import React from "react";
import { daysLeft } from "@/lib/utils";
import { BookOpen, User } from "lucide-react";

interface FundCardProps {
  owner: string;
  title: string;
  description?: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image?: string;
  category: string;
  handleClick: () => void;
}

const FundCard: React.FC<FundCardProps> = ({
  owner,
  title,
  description,
  target,
  deadline,
  amountCollected,
  image,
  category,
  handleClick,
}) => {
  const remainingDays = daysLeft(deadline);

  // -> Calculate progress safely
  const targetAmount = parseFloat(target);
  const collectedAmount = parseFloat(amountCollected);
  const progress =
    targetAmount > 0 ? (collectedAmount / targetAmount) * 100 : 0;

  return (
    <div
      className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10"
      onClick={handleClick}
    >
      <div className="relative w-full h-[160px] bg-[#3a3a43] rounded-t-[15px] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-[#808191]" />
          </div>
        )}
      </div>

      <div className="flex flex-col p-4">
        <div className="flex flex-row items-center mb-[18px]">
          <p className="ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[#808191]">
            {category}
          </p>
        </div>

        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate group-hover:text-[#4acd8d]">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {description || "No description provided."}
          </p>
        </div>

        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {collectedAmount} ETH
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Raised of {targetAmount} ETH
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Days Left
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative w-full h-[6px] bg-[#3a3a43] rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-[#4acd8d] rounded-full"
              style={{
                width: `${Math.min(progress, 100)}%`, // Ensure width doesn't exceed 100%
              }}
            />
          </div>
        </div>

        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
            <User className="w-1/2 h-1/2 text-[#808191]" />
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">
            by <span className="text-[#b2b3bd]">{owner}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FundCard;
