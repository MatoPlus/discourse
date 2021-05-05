export const setErrorStatusToast = (errors: any[], toast: any) => {
  errors.forEach((error) => {
    if ((error as any).status) {
      toast({
        title: (error as any).status,
        status: "error",
        duration: 2000,
        position: "bottom-left",
        isClosable: true,
      });
    }
  });
};
