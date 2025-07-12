// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OptionPricer
 * @dev European vanilla option fair-value (Black-Scholes) in 18-dec fixed-point
 *
 * Inputs:
 *  - isCall: true=Call, false=Put
 *  - S: spot price       (18 dec)
 *  - K: strike price     (18 dec)
 *  - T: time-to-maturity (years, 18 dec)  e.g. 30 days ≈ 30/365 ≈ 0.08219e18
 *  - sigma: volatility   (annualised, 18 dec, e.g. 0.25e18 = 25 %)
 *  - r: risk-free rate   (annualised, 18 dec, e.g. 0.04e18 = 4 %)
 *
 * Return: option fair value (18 dec)
 *
 * Math backend: PRBMath v4 (SD59x18) + Abramowitz-Stegun 7.1.26 CDF
 */
import { SD59x18, sd } from "@prb/math/SD59x18.sol";
import { UD60x18, ud } from "@prb/math/UD60x18.sol";

library StdNormal {

    // √(2π) in 18-dec
    SD59x18 private constant SQRT_2PI = SD59x18.wrap(2506628274631000502); // ≈ √(2π)*1e18

    /**
     * @dev standard normal PDF  φ(x)
     */
    function pdf(SD59x18 x) internal pure returns (SD59x18) {
        return x.mul(x).div(sd(-2e18)).exp().div(SQRT_2PI);
    }

    /**
     * @dev Abramowitz-Stegun 7.1.26 CDF approximation. |ε| < 7.5e-8
     */
    function cdf(SD59x18 x) internal pure returns (SD59x18) {
        SD59x18 z = x.abs();
        SD59x18 k = sd(1e18).div(sd(1e18).add(z.mul(sd(231641900000000)))); // 0.2316419
        
        // polynomial Σ a_i k^i with corrected coefficients
        SD59x18 w = k.mul(sd(319381530000000));  // a1 = 0.31938153
        w = k.mul(w.sub(sd(356563782000000)));    // a2 = -0.356563782
        w = k.mul(w.add(sd(1781477937000000)));   // a3 = 1.781477937
        w = k.mul(w.sub(sd(1821255978000000)));   // a4 = -1.821255978
        w = k.mul(w.add(sd(1330274429000000)));   // a5 = 1.330274429
        
        w = sd(1e18).sub(pdf(z).mul(w));
        return x.lt(sd(0)) ? sd(1e18).sub(w) : w;
    }
}

contract OptionPricer {

    function bsPrice(
        bool isCall,
        int256 S, int256 K,
        int256 T, int256 sigma, int256 r
    ) external pure returns (int256) {
        // Input validation
        require(S > 0, "Spot price must be positive");
        require(K > 0, "Strike price must be positive");
        require(T > 0, "Time to maturity must be positive");
        require(sigma > 0, "Volatility must be positive");
        
        SD59x18 s = sd(S);
        SD59x18 k = sd(K);
        SD59x18 t = sd(T);
        SD59x18 v = sd(sigma);
        SD59x18 rf = sd(r);

        SD59x18 sigSqrtT = v.mul(t.sqrt());
        
        // d1 = (ln(S/K) + (r + σ²/2)T) / (σ√T)
        SD59x18 d1 = (s.div(k).ln().add(rf.add(v.mul(v).div(sd(2e18))).mul(t))).div(sigSqrtT);
        SD59x18 d2 = d1.sub(sigSqrtT);

        SD59x18 Nd1 = StdNormal.cdf(d1);
        SD59x18 Nd2 = StdNormal.cdf(d2);

        SD59x18 discK = k.mul((sd(0).sub(rf.mul(t))).exp());

        SD59x18 price;
        if (isCall) {
            // Call: S*N(d1) - K*e^(-rT)*N(d2)
            price = s.mul(Nd1).sub(discK.mul(Nd2));
        } else {
            // Put: K*e^(-rT)*N(-d2) - S*N(-d1)
            price = discK.mul(sd(1e18).sub(Nd2)).sub(s.mul(sd(1e18).sub(Nd1)));
        }

        return price.unwrap();
    }
    
    /**
     * @dev Calculate option Greeks
     */
    function delta(
        bool isCall,
        int256 S, int256 K,
        int256 T, int256 sigma, int256 r
    ) external pure returns (int256) {
        SD59x18 s = sd(S);
        SD59x18 k = sd(K);
        SD59x18 t = sd(T);
        SD59x18 v = sd(sigma);
        SD59x18 rf = sd(r);

        SD59x18 sigSqrtT = v.mul(t.sqrt());
        SD59x18 d1 = (s.div(k).ln().add(rf.add(v.mul(v).div(sd(2e18))).mul(t))).div(sigSqrtT);
        
        SD59x18 Nd1 = StdNormal.cdf(d1);
        
        return isCall ? Nd1.unwrap() : (Nd1.sub(sd(1e18))).unwrap();
    }
}