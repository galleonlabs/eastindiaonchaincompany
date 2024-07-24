// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract EIOCToken is ERC20, ERC20Permit {
    constructor() ERC20("East India Onchain Company", "EIOC") ERC20Permit("EIOC") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }
}