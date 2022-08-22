import React, { useState, useEffect } from "react";
import SmpToken from "../contract/SmpToken";
import UsdtToken from "../contract/UsdtToken";
import SmpToUsdt from "../contract/SmpToUsd";
import { ToastContainer, toast } from "react-toastify";

export default function Home() {
  const [smpTokenValue, setSmpTokenValue] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [userAddress, setUserAddress] = useState("");
  const [userSmpTokenBalance, setUserSmpTokenBalance] = useState(0);
  const [userUsdtBalance, setUserUsdtBalance] = useState(0);
  const [swapRate, setSwapRate] = useState(0);
  const [transferTrue, setTransferTrue] = useState(false);
  const [approveLoader, setApproveLoader] = useState(false);
  const [buyLoader, setBuyLoader] = useState(false);
  const [disbaleInput, setDisableInput] = useState(false);

  useEffect(() => {
    // console.log("useeffect");
    getSmpTokenBalance();
    getUserUsdtBalance();
    getSwapRate();

    return () => {};
  }, [userAddress]);

  const getSwapRate = async () => {
    try {
      let rate = await SmpToUsdt._swapRate();
      // console.log("swap rate", parseFloat(rate.toString() / 100));
      setSwapRate(parseFloat(rate.toString() / 100));
    } catch (error) {}
  };
  const handleWalletConnect = () => {
    // console.log("wallet connect", window.ethereum);
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(handleAccountsChanged)
        .catch((err) => {
          if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            // console.log("Please connect to MetaMask.");
          } else {
            console.error(err);
          }
        });
      return true;
    } else {
      return false;
      // console.log("Please connect to MetaMask.");
    }
  };
  function handleAccountsChanged(accounts) {
    let currentAccount;

    console.log("accounts", window.ethereum.networkVersion == "56");
    if (window.ethereum) {
      if (window.ethereum.networkVersion !== "56") {
        toast.error("Please connect to Binance Mainnet");
      }
    }

    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      // console.log("Please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      setUserAddress(currentAccount);

      // Do any other work!
    }
  }
  const getSmpTokenBalance = async () => {
    // console.log("useraddress", userAddress);
    try {
      if (userAddress) {
        let balance = await SmpToken.balanceOf(userAddress);
        // console.log("baal", balance);
        setUserSmpTokenBalance(balance);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = async () => {
    console.log("approve", parseInt(userSmpTokenBalance.toString()));
    console.log("approve", parseInt(smpTokenValue.toString()));
    // return null;
    let balance = (userSmpTokenBalance / 10 ** 8).toString();
    console.log("balance", balance);

    if (!userAddress) {
      return toast.error("Metasmask not connected");
    }

    if (smpTokenValue < 1) {
      return toast.error("SMP Token Value Should be greater then zero.");
    }
    if (parseInt(balance) < parseInt(smpTokenValue)) {
      toast.error("You don't have enough SMP Token");
      return null;
    }
    // console.log("handle approve", SmpToken);
    setApproveLoader(true);

    try {
      setDisableInput(true);
      let value = smpTokenValue * 10 ** 8;
      // console.log("value", value);
      let approve = await SmpToken.approve(
        "0xf36DEDba1912d46DfeA7023A39bcbF6EF1671482",
        value
      );
      let waitForTx = await approve.wait();
      if (waitForTx) {
        toast.success("Approve Successful");

        setTransferTrue(true);
        setApproveLoader(false);
      }

      // console.log("approve", approve);
    } catch (error) {
      setApproveLoader(false);
    }
  };
  const getUserUsdtBalance = async () => {
    try {
      let userUsdtBalance = await UsdtToken.balanceOf(userAddress);
      // console.log("usdt balance", userUsdtBalance.toString());
      setUserUsdtBalance(userUsdtBalance);
    } catch (error) {}
  };

  const handleBuy = async () => {
    setBuyLoader(true);
    // console.log("buy");
    try {
      let value = smpTokenValue * 10 ** 8;

      let buy = await SmpToUsdt.depositSmp(value);
      // console.log("buy", buy);
      let waitFortx = await buy.wait();
      if (waitFortx) {
        toast.success("Sell Successful!");

        setBuyLoader(false);
        setDisableInput(false);
        setTransferTrue(false);
      }
      // console.log("wait", waitFortx);
    } catch (error) {
      // toast.error()
      setTransferTrue(false);

      setBuyLoader(false);
      setDisableInput(false);
    }
  };
  return (
    <>
      <ToastContainer autoClose={3000} />
      <nav
        className="navbar navbar-expand-lg navbar-light "
        style={{
          backgroundColor: "#2D3748",
        }}
      >
        <div className="container-fluid">
          <a
            className="navbar-brand text-white ms-3"
            href="#"
            style={{
              fontSize: "25px",
            }}
          >
            <span>
              {" "}
              <img
                src="./logo.png"
                width={33}
                className="me-3 rounded"
                alt="logo"
              />
              SME x SWAP
            </span>{" "}
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                {userAddress ? (
                  <button
                    className="btn text-dark bg-white "
                    // onClick={handleWalletConnect}

                    disabled
                    style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      width: "160px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {" "}
                    {userAddress}
                  </button>
                ) : (
                  <button
                    className="btn text-dark bg-white "
                    onClick={handleWalletConnect}
                  >
                    {" "}
                    Connect Wallet{" "}
                  </button>
                )}
                {/* <a className="nav-link active text-white" aria-current="page" href="#">
                Home
              </a> */}
              </li>
              <li className="nav-item">
                {/* <a className="nav-link" href="#">
                Link
              </a> */}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="container mt-3">
        <div className="row d-flex justify-content-center">
          <div
            className="col-lg-4 border p-2 rounded border-dark"
            style={{
              backgroundColor: "rgba(226, 226, 226,0.50)",
            }}
          >
            <div className="col border p-2 rounded border-dark">
              <div className="col ">
                <div className="row pt-2 ">
                  <div className="col-2">
                    <img
                      src="./logo.png"
                      width={50}
                      height={50}
                      className="rounded"
                      alt=""
                    />{" "}
                  </div>
                  <div className="col pt-3">
                    <h3>SMP</h3>
                  </div>
                </div>
                <div className="row border mt-3 mb-3 mx-2 p-2 border-dark rounded bg-light">
                  <div className="col-12">
                    <div className="row">
                      <div className="col-4">
                        <span>
                          <img
                            src="./logo.png"
                            width={20}
                            className="rounded  me-1"
                            alt="smp logo"
                          />{" "}
                          SMP
                        </span>
                      </div>
                      <div className="col-8 d-flex justify-content-end">
                        <span className="text-end">
                          Balance{" "}
                          {parseInt(
                            userSmpTokenBalance.toString() / 10 ** 8
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col pt-3">
                    <input
                      className="form-control border-dark"
                      type="text"
                      placeholder="Enter Value"
                      aria-label="default input example"
                      value={smpTokenValue}
                      disabled={disbaleInput}
                      onChange={(e) => {
                        setSmpTokenValue(e.target.value);
                        setUsdValue(
                          parseFloat(e.target.value * swapRate).toFixed(1)
                        );
                      }}
                    />
                  </div>
                </div>
                <hr />
                <div className="row border mt-3 mb-2 mx-2 p-2 border-dark rounded bg-light">
                  <div className="col-12">
                    <div className="row">
                      <div className="col">
                        <span>
                          <img
                            src="./usdt.png"
                            width={20}
                            className="rounded  me-1"
                            alt="smp logo"
                          />{" "}
                          USDT
                        </span>
                      </div>
                      <div className="col d-flex justify-content-end">
                        <span>
                          Balance{" "}
                          {parseInt(
                            userUsdtBalance.toString() / 10 ** 18
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col pt-3">
                    <input
                      className="form-control border-dark"
                      type="text"
                      placeholder="Enter Value"
                      aria-label="default input example"
                      value={usdValue}
                      disabled={disbaleInput}
                      onChange={(e) => setUsdValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* live price  */}
              <p className="ps-3">
                Price {swapRate ? swapRate : ""} USDT per SMP
              </p>
              <div className="row  pt-3">
                <div className="col d-flex justify-content-center">
                  {transferTrue === false ? (
                    <>
                      {approveLoader ? (
                        <div
                          className="spinner-border text-success"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <button
                          className="btn btn-success"
                          onClick={handleApprove}
                        >
                          Approve
                        </button>
                      )}{" "}
                    </>
                  ) : (
                    <>
                      {buyLoader ? (
                        <div
                          className="spinner-border text-success"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <button
                          className="btn btn-danger px-5"
                          onClick={handleBuy}
                        >
                          sell
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
