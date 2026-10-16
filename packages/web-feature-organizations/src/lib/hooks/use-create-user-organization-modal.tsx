import {useCallback, useState} from "react";
import {CreateUserOrganizationModal} from "../modals/create-user-organization-modal";

type UseCreateUserOrganizationModalOptions = {
  userId: string;
};

export const useCreateUserOrganizationModal = ({
  userId,
}: UseCreateUserOrganizationModalOptions) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const Modal = useCallback(() => (
    <CreateUserOrganizationModal
      open={isOpen}
      onOpenChange={setIsOpen}
      userId={userId}
    />
  ), [isOpen, userId]);

  return {
    Modal,
    open,
    close,
    isOpen,
  };
};
