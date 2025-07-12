// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OptionBatchPricer
 * @notice Calculates Black-Scholes 공정가치를 옵션 배열에 대해 한 번에 반환합니다.
 * @dev  ✓ pure, memory-only, unchecked loop‧via-IR 최적화  
 *      Monad 체인의 대량 병렬 실행 이점을 극대화할 수 있도록 설계했습니다.
 *
 *      ─ 입력값 18-dec 고정소수점 ─
 *          • isCall : true=콜, false=풋  
 *          • S      : 현물가  
 *          • K      : 행사가  
 *          • T      : 만기까지 기간(연 단위)  
 *          • sigma  : 변동성(연율)  
 *          • r      : 무위험이자율(연율)
 *
 *      ─ 반환 ─
 *          • prices : 각 옵션 공정가치(18-dec), 입력 순서와 동일
 *
 *      ※ OptionPricer(bsPrice) 로직을 상속해 내부 호출하므로
 *        **OptionPricer.sol** 이 동일 디렉터리에 있어야 합니다.
 */

import "./OptionPricer.sol";

contract OptionBatchPricer is OptionPricer {
    /// @dev 개별 옵션 입력 구조체
    struct OptionInput {
        bool   isCall;
        int256 S;
        int256 K;
        int256 T;
        int256 sigma;
        int256 r;
    }

    /**
     * @notice 옵션 배열의 공정가치를 일괄 계산
     * @param inputs OptionInput[]  옵션 파라미터 배열
     * @return prices int256[]      각 옵션의 18-dec 공정가치
     */
    function priceBatch(OptionInput[] calldata inputs)
        external
        pure
        returns (int256[] memory prices)
    {
        uint256 len = inputs.length;
        prices = new int256[](len);

        unchecked {
            for (uint256 i; i < len; ++i) {
                OptionInput calldata op = inputs[i];
                prices[i] = bsPrice(
                    op.isCall,
                    op.S,
                    op.K,
                    op.T,
                    op.sigma,
                    op.r
                );
            }
        }
    }
}
