import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
// @ts-ignore
import { useUserContext } from "../context/UserContext";
import { RadioGroup } from "@headlessui/react";

type WalletConnectProps = {
  closeModal: () => void;
  isOpen: boolean;
};
export default function WalletConnect({
  closeModal,
  isOpen,
}: WalletConnectProps) {
  const {
    whichWalletSelected,
    handleWalletSelect,
    wallets,
    refreshData,
  } = useUserContext();
  console.log(whichWalletSelected);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-lg bg-opacity-75" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1E2834]  p-6 text-left align-middle shadow-xl transition-all">
                  {wallets.length === 0 ? null : (
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-white"
                    >
                      Connect Wallet
                    </Dialog.Title>
                  )}

                  {wallets.length === 0 ? (
                    <p className="text-white text-2xl text-center">
                      No Wallet Found
                    </p>
                  ) : (
                    <div className="my-2">
                      <RadioGroup
                        value={whichWalletSelected}
                        onChange={handleWalletSelect}
                        className="grid grid-cols-2 w-full justify-around gap-8 p-4 flex-wrap text-white"
                      >
                        {wallets.map((key: any) => (
                          <RadioGroup.Option key={key} value={key}>
                            {({ checked }) => (
                              <div
                                className={`relative flex border-2 text-white justify-center items-center flex-col p-4 rounded-xl  
                            ${
                              checked
                                ? "    border-slate-200"
                                : " border-slate-500"
                            } `}
                              >
                                <span className="text-xs absolute top-2 right-2">
                                  {key}
                                </span>
                                <img
                                  alt="notfound"
                                  src={window.cardano[key].icon}
                                  width={50}
                                  height={50}
                                  className="cursor-pointer"
                                />
                                <p className="text-sm text-center mt-2">
                                  {window.cardano[key].name.split(" ")[0]}
                                </p>
                              </div>
                            )}
                          </RadioGroup.Option>
                        ))}
                        {/* <RadioGroup.Option value="typhoncip30">
                        {({ checked }) => (
                          <div
                            className={`flex border-2 text-white justify-center items-center flex-col p-4 rounded-xl  
                          ${
                            checked
                              ? "    border-slate-200"
                              : " border-slate-500"
                          } `}
                          >
                            <img
                              alt="notfound"
                              src="/assets/typhon.png"
                              width={60}
                              height={50}
                              className="cursor-pointer"
                            />
                            <p className="text-sm text-center mt-2">Typhon</p>
                          </div>
                        )}
                      </RadioGroup.Option>
                      <RadioGroup.Option value="eternal">
                        {({ checked }) => (
                          <div
                            className={`flex border-2 text-white justify-center items-center flex-col p-4 rounded-xl  
                          ${
                            checked
                              ? "    border-slate-200"
                              : " border-slate-500"
                          } `}
                          >
                            <img
                              alt="notfound"
                              src="/assets/eternal.png"
                              width={60}
                              height={50}
                              className="cursor-pointer"
                            />
                            <p className="text-sm text-center mt-2">Eternal</p>
                          </div>
                        )}
                      </RadioGroup.Option>

                      <RadioGroup.Option value="nami">
                        {({ checked }) => (
                          <div
                            className={`flex border-2 text-white justify-center items-center flex-col p-4 rounded-xl  
                          ${
                            checked
                              ? "    border-slate-200"
                              : " border-slate-500"
                          } `}
                          >
                            <img
                              alt="notfound"
                              src="/assets/nami.svg"
                              width={60}
                              height={50}
                              className="cursor-pointer"
                            />
                            <p className="text-sm text-center mt-2">Nami</p>
                          </div>
                        )}
                      </RadioGroup.Option> */}
                      </RadioGroup>
                      <button
                        onClick={refreshData}
                        className="text-white p-2  w-full border-red-50 border rounded-lg"
                      >
                        Refresh Wallet
                      </button>
                      <p className="text-sm text-gray-300 text-center my-4 px-5">
                        Make transaction using these Four Wallets only.
                      </p>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
