import React from "react";

function Navbar() {
	return (
		<>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					flexDirection: "row",
					gap: "20px 20px",
					justifyContent: "center",
				}}
			>
				<a href="/home">Home</a>
				<a href="/store">Store</a>
				<a href="/community">Community</a>
				<a href="/about">About</a>
			</div>
		</>
	);
}

export default Navbar;
