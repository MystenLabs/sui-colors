import { useSuiClientQuery } from "@mysten/dapp-kit";

export const useGetCanvas = () => {
  const handleGetCanvas = () => {
    const id: string =
      "0xe3390ae6a360a076b708691b2a1c24981b931e009cbf4aa6531e559c93d1f28c";

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
