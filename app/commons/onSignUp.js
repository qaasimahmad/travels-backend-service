/* eslint-disable max-len*/
const ejs           = require("ejs");

const clientBaseUrl = process.env.CLIENT_BASE_URL;

exports.mailBody = (user) => {
  const userData       = user.user[ 0 ];
  const code           = user.user[ 1 ];
  const subscriptionId = user.user[ 2 ];

  return ejs.render(
    `<table style="border-spacing: 0; border-collapse: collapse; vertical-align: top; background-color: transparent"
		cellpadding="0" cellspacing="0" align="center" width="100%" border="0">
		<tbody>
			<tr style="vertical-align: top">
				<td style="word-break: break-word; border-collapse: collapse!important; vertical-align: top" width="100%">
					<table
						style="border-spacing: 0; border-collapse: collapse; vertical-align: top; max-width: 500px; margin: 0 auto; text-align: inherit"
						cellpadding="0" cellspacing="0" align="center" width="100%" border="0">
						<tbody>
							<tr style="vertical-align: top">
								<td style="word-break: break-word; border-collapse: collapse!important; vertical-align: top"
									width="100%">
									<table
										style="border-spacing: 0; border-collapse: collapse; vertical-align: top; width: 100%; max-width: 500px; color: #000000; background-color: transparent"
										cellpadding="0" cellspacing="0" width="100%" bgcolor="transparent">
										<tbody>
											<tr style="vertical-align: top">
												<td
													style="word-break: break-word; border-collapse: collapse!important; vertical-align: top; text-align: center; font-size: 0">
													<div style="display: inline-block; vertical-align: top; width: 500px">
														<table
															style="border-spacing: 0; border-collapse: collapse; vertical-align: top"
															cellpadding="0" cellspacing="0" align="center" width="100%"
															border="0">
															<tbody>
																<tr style="vertical-align: top">
																	<td
																		style="word-break: break-word; border-collapse: collapse!important; vertical-align: top; background-color: transparent; padding-top: 0; padding-right: 0; padding-bottom: 30px; padding-left: 0; border-top: 1px solid #ededed; border-right: 1px solid #ededed; border-bottom: 1px solid #ededed; border-left: 1px solid #ededed">
																		<table
																			style="border-spacing: 0; border-collapse: collapse; vertical-align: top; background: repeat"
																			cellpadding="0" cellspacing="0" width="100%">
																			<tbody>
																				<tr style="vertical-align: top">
																					<td
																						style="word-break: break-word; border-collapse: collapse!important; vertical-align: top; padding-top: 40px; padding-right: 10px; padding-bottom: 0px; padding-left: 10px">
																						<div
																							style="color: #fdfffe; line-height: 150%; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif">
																							<div
																								style="padding-bottom: 20px; padding-left: 10px; padding-right: 10px">
																								<p
																									style="margin: 0; max-width: 300px; font-size: 16px; line-height: 18px; text-align: left; color: #0d3e65; padding-left: 10px; padding-right: 10px">
																									Dear ${userData.username}
																								</p>
																								<p
																									style="margin: 0; font-size: 14px; line-height: 17px; text-align: left; padding-top: 20px; padding-left: 10px; padding-right: 10px; color: #0d3e65">
																									Welcome to <b>Geo Travel</b>. <br>
																									Experience wide varieties of fantastic destinations with us.<br>
																								</p>
                                                                                                <br>
																								<p
																								style="margin: 0; max-width: 300px; font-size: 16px; line-height: 18px; text-align: left; color: #0d3e65; padding-left: 10px; padding-right: 10px">
																								Find your information below:
																								<br />
																							</p>
																							</div>
																						</div>
																					</td>
																				</tr>
																			</tbody>
																		</table>
	
																		<table
																			style="border-spacing: 0; border-collapse: collapse; vertical-align: top"
																			cellpadding="0" cellspacing="0" width="100%">
																			<tbody>
																				<tr style="vertical-align: top">
																					<td
																						style="word-break: break-word; border-collapse: collapse!important; vertical-align: top; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px">
																						<div
																							style="color: #555555; line-height: 120%; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif">
																							<div
																								style="font-size: 14px; line-height: 17px; text-align: left; color: #555555; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif; border-bottom: solid 1px #ededed; padding-top: 15px; padding-right: 10px; padding-bottom: 15px; padding-left: 10px">
																									
																							</div>
																						</div>
																					</td>
																				</tr>
																					<tr style="vertical-align: top">
																					<td
																						style="word-break: break-word; border-collapse: collapse!important; vertical-align: top; padding-top: 0; padding-right: 20px; padding-bottom: 0; padding-left: 20px">
																						<div
																							style="color: #555555; line-height: 120%; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif">
																							<div
																								style="font-size: 14px; line-height: 17px; text-align: left; color: #555555; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif; padding-top: 15px; padding-right: 10px; padding-bottom: 15px; padding-left: 10px; border-bottom: solid 1px #ededed">
																								<p
																									style="margin: 0; font-size: 14px; line-height: 17px; text-align: left">
																									Fullname&nbsp;
																									<strong
																										style="float: right">${userData.username}</strong>
																									<br />
																								</p>
																								<p
																									style="margin: 0; font-size: 14px; line-height: 17px; text-align: left">
																									Email&nbsp;
																									<strong
																										style="float: right">${userData.email}</strong>
																									<br />
																								</p>
																							
																								<br>
																								
																								<p
																									style="margin: 0; font-size: 14px; line-height: 21px; text-align: center; padding-left: 20px; color: #0d3e65">
			
																									Follow this Link to Activate your account<br>
																									<a href="${clientBaseUrl}verify-email/${code}">Activate Account</a><br>
																								</p>

																								<br>
																							</div>
																						</div>
																					</td>
																				</tr>

                                                                                <tr>
                                                                                    <td 
                                                                                    style="word-break: break-word; border-collapse: collapse!important; vertical-align: top; padding-top: 20px; padding-right: 10px; padding-bottom: 20px; padding-left: 10px">
																					<div
																						style="color: #555555; line-height: 150%; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif">
																						<div
																							style="font-size: 14px; line-height: 21px; text-align: left; color: #555555; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif">
																							<p
                                                                                            style="margin: 0; font-size: 14px; line-height: 21px; text-align: center; padding-left: 20px; color: #0d3e65">
																								<b>Yours Sincerly, <br> Geo Travel's Team</b><br>
																								<a href="${clientBaseUrl}">Go with Geo &#9992;</a><br>
																							</p> <br>

																							<p
																							style="margin: 0; font-size: 14px; line-height: 21px; text-align: center; padding-left: 20px; color: #0d3e65">

																							to unsubscrbe from our newsletter anytime, click here<br>
																							<a href="${clientBaseUrl}unsubscribe/${subscriptionId}">unsubscribe</a><br>
																							</p>

																						</div>
																					</div>
                                                                                    
                                                                                    </td>
                                                                                </tr>
																			</tbody>
																		</table>
																							</table>
																						</div>
																					</td>
																				</tr>
																			</tbody>
																		</table>
																
																	</td>
																</tr>
															</tbody>
														</table>
													</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table>`,
    user
  );
};
