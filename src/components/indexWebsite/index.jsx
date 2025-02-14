import React from "react";
import Image from "next/image";
import Logo from "../../../public/assets/web/logo.svg";
import giddhLogo from "../../../public/assets/web/logos/giddh.svg";
import socketLogo from "../../../public/assets/web/logos/socket.svg";
import freejunLogo from "../../../public/assets/web/logos/freejun.svg";
import msg91Logo from "../../../public/assets/web/logos/msg91.svg";
import dbdashLogo from "../../../public/assets/web/logos/dbdash.svg";
import walkoverLogo from "../../../public/assets/web/logos/walkover.svg";
import {
  MdAccessTimeFilled,
  MdGroups,
  MdRocketLaunch,
  MdApi,
} from "react-icons/md";
import bannerImage from "../../../public/assets/web/techdoc-front-page.png";
import content from "@/components/indexWebsite/indexWebsite.json";

export default function IndexWebsite() {
  const logoMap = {
    giddh: giddhLogo,
    socket: socketLogo,
    freejun: freejunLogo,
    msg91: msg91Logo,
    dbdash: dbdashLogo,
    walkover: walkoverLogo,
  };
  return (
    <>
      <div className="web_body">
        <div className="navigation-page">
          {/* navbar */}
          <div className="navigation d-flex justify-content-between container p-4">
            <Image src={Logo} alt="Website Logo" width={100} height={50} />
            <div className="d-flex align-items-center nav-menu">
              <a href="/login">
                <button className="btn web_btn-login web_btn-rg web_btn">
                  Login
                </button>
              </a>
              <a href="/login">
                <button className="btn web_btn-primary web_btn-rg web_btn ">
                  Signup
                </button>
              </a>
            </div>
          </div>
          {/* navbar */}
          <div className="web_hero container d-flex flex-column gy-4">
            <div className="front-web-page">
              <p className="web_tagline">The developer's toolkit</p>
              <h1 className="web_h1">
                Test & <br />
                <span className="font-american web_text-primary">
                  Document APIs
                </span>
                <br />
                Faster with TechDoc
              </h1>
              <p className="web_tagline">
                The Ultimate Free Solution for Your API Needs!
              </p>
              <a href="/login">
                {" "}
                <button className="btn web_btn-primary web_btn-rg web_btn">
                  Get Started for free
                </button>
              </a>
            </div>
            <Image src={bannerImage} alt="Techdoc Banner Image" />
          </div>
        </div>
        <div className="container d-flex flex-column web_bg-sec py-5">
          <h2 className="web_h2 mb-5">
            Experience <span className="font-american ">the Benefits </span>
            <br />
            of TechDoc
          </h2>
          <div className="web_benifit_grid">
            {content?.benefits?.map((benefit, i) => {
              let icon = null;

              switch (benefit.slug) {
                case "productivity":
                  icon = <MdAccessTimeFilled fontSize={40} color="#EC5413" />;
                  break;
                case "collaboration":
                  icon = <MdGroups fontSize={40} color="#EC5413" />;
                  break;
                case "efficiency":
                  icon = <MdRocketLaunch fontSize={40} color="#EC5413" />;
                  break;
                case "apis":
                  icon = <MdApi fontSize={40} color="#EC5413" />;
                  break;
                default:
                  icon = null;
              }

              return (
                <div
                  key={benefit.id ?? `benefit-${i}`}
                  className="d-flex flex-column"
                >
                  {icon}
                  <h3
                    dangerouslySetInnerHTML={{ __html: benefit?.name }}
                    className="my-3"
                  ></h3>
                  <p>{benefit?.description}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className=" bg-white py-5">
          <div className="container web_cont d-flex flex-column">
            <h2 className="web_h2 mb-5">
              The results speak for themselves,
              <br />
              <span className="font-american ">so do our customers</span>
            </h2>
            <div className="web_logogrid">
              {content?.customers?.map((customer, i) => {
                const logoSrc = logoMap[customer?.name];
                return (
                  <a
                    href={customer.urls}
                    target="_blank"
                    key={customer.name || i}
                    className={`${
                      i === 2 || i === 3 ? "col_span_2" : "col_span-1"
                    } grid_col`}
                    aria-label="website icons"
                  >
                    {logoSrc && (
                      <Image
                        src={logoSrc}
                        alt={customer.name}
                        width={100}
                        height={50}
                      />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container web_cont">
          <div className="d-flex flex-md-row flex-column  justify-content-between align-items-center">
            <Image src={Logo} alt="Website Logo" width={100} height={50} />

            <div className="d-flex align-items-center gap-4">
              <a
                href="https://roadmap.workspace91.com/b/6m4xy1v4/feature-ideas"
                target="_blank"
                className="text-black"
              >
                Request a feature
              </a>
              <p className="m-0">© 2024 TechDoc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
