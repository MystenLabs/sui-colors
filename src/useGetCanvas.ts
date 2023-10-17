import { useSuiClientQuery } from "@mysten/dapp-kit";

export const useGetCanvas = () => {
  const handleGetCanvas = () => {
    const id: string =
      "0x5454237f232a31874fc5fd2d2128d46cd43f12146b7af2ccc6615e16e56409c0";

    const { data, isLoading, error, refetch } = useSuiClientQuery("getObject", {
      id,
      options: {
        showContent: true,
        showOwner: true,
      },
    });

    return { data, isLoading, error, refetch };
  };

  return { handleGetCanvas };
};
